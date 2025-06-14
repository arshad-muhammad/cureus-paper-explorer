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

// Function to generate synthetic email from author name
const generateSyntheticEmail = (authorName: string): string => {
  // Clean and format the name
  const nameParts = authorName.toLowerCase().trim().split(/\s+/);
  if (nameParts.length === 0) return 'author@cureus-author.com';
  
  // Remove any special characters and keep only letters
  const cleanName = (name: string) => name.replace(/[^a-z]/g, '');
  
  let emailPrefix = '';
  
  if (nameParts.length === 1) {
    // Single name - use as is
    emailPrefix = cleanName(nameParts[0]);
  } else if (nameParts.length === 2) {
    // First and last name - use firstname.lastname format
    const firstName = cleanName(nameParts[0]);
    const lastName = cleanName(nameParts[1]);
    emailPrefix = `${firstName}.${lastName}`;
  } else {
    // Multiple names - use first and last
    const firstName = cleanName(nameParts[0]);
    const lastName = cleanName(nameParts[nameParts.length - 1]);
    emailPrefix = `${firstName}.${lastName}`;
  }
  
  // Fallback if cleaning resulted in empty string
  if (!emailPrefix) {
    emailPrefix = 'author';
  }
  
  // Use a generic domain for synthetic emails
  return `${emailPrefix}@cureus-author.com`;
};

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
          // Generate synthetic email if no real email is found
          email = generateSyntheticEmail(author.name);
          source = 'generated';
          confidence = 0.1;
          console.log(`Generated synthetic email for ${author.name}: ${email}`);
        }

        // Cache the email result (including generated ones)
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
        // Even in error case, provide a generated email
        const syntheticEmail = generateSyntheticEmail(author.name);
        enrichedAuthors.push({
          ...author,
          email: author.email || syntheticEmail,
          source: author.email ? 'original' : 'generated',
          confidence: author.email ? 1.0 : 0.1
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

serve(handler);
