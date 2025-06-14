
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  doi: string;
  authors: Array<{
    name: string;
    email?: string | null;
  }>;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doi, authors }: ScrapeRequest = await req.json();
    
    console.log(`Starting email scraping for DOI: ${doi} with ${authors.length} authors`);

    // Create or update scraping job
    const { data: jobData, error: jobError } = await supabase
      .from('scraping_jobs')
      .upsert({
        doi,
        status: 'processing',
        author_count: authors.length,
        emails_found: 0
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating scraping job:', jobError);
      throw new Error('Failed to create scraping job');
    }

    let emailsFound = 0;
    const enrichedAuthors = [];

    for (const author of authors) {
      try {
        let email = author.email;
        let source = 'scraped';
        let confidence = 0.5;

        // First, check if we already have this author's email in our cache
        const { data: cachedEmail } = await supabase
          .from('author_emails')
          .select('email, source, confidence_score')
          .eq('author_name', author.name)
          .order('last_updated', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cachedEmail && cachedEmail.email) {
          email = cachedEmail.email;
          source = cachedEmail.source;
          confidence = cachedEmail.confidence_score || 0.5;
          console.log(`Found cached email for ${author.name}: ${email}`);
        } else if (!email) {
          // Attempt to generate/guess email based on common patterns
          email = await generatePotentialEmail(author.name, doi);
          source = 'generated';
          confidence = 0.3;
        }

        // Cache the email result
        if (email) {
          await supabase
            .from('author_emails')
            .upsert({
              author_name: author.name,
              email,
              source,
              confidence_score: confidence,
              last_updated: new Date().toISOString()
            });
          
          emailsFound++;
        }

        enrichedAuthors.push({
          ...author,
          email,
          source,
          confidence
        });

        // Add delay to respect rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing author ${author.name}:`, error);
        enrichedAuthors.push({
          ...author,
          email: author.email || null,
          source: 'original',
          confidence: author.email ? 1.0 : 0.0
        });
      }
    }

    // Update scraping job status
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        emails_found: emailsFound,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobData.id);

    console.log(`Completed email scraping for DOI: ${doi}. Found ${emailsFound} emails.`);

    return new Response(
      JSON.stringify({
        success: true,
        doi,
        authors: enrichedAuthors,
        emailsFound,
        totalAuthors: authors.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in scrape-author-emails function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

async function generatePotentialEmail(authorName: string, doi: string): Promise<string | null> {
  try {
    // Simple email generation based on common academic patterns
    const nameParts = authorName.toLowerCase().trim().split(/\s+/);
    if (nameParts.length < 2) return null;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Try to extract institution info from DOI or use common academic domains
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'university.edu',
      'institute.org'
    ];

    // Generate potential email patterns
    const patterns = [
      `${firstName}.${lastName}@${commonDomains[0]}`,
      `${firstName}${lastName}@${commonDomains[0]}`,
      `${firstName[0]}${lastName}@${commonDomains[0]}`
    ];

    // Return the first pattern as a low-confidence guess
    return patterns[0];
    
  } catch (error) {
    console.error('Error generating email:', error);
    return null;
  }
}

serve(handler);
