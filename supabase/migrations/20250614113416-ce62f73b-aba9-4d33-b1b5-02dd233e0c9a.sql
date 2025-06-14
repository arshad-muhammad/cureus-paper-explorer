
-- Create a table to cache author emails and improve performance
CREATE TABLE public.author_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL CHECK (source IN ('scraped', 'generated', 'manual')),
  confidence_score NUMERIC(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for faster author lookups
CREATE INDEX idx_author_emails_name ON public.author_emails(author_name);
CREATE INDEX idx_author_emails_updated ON public.author_emails(last_updated);

-- Create a table to track scraping jobs and rate limiting
CREATE TABLE public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doi TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  author_count INTEGER DEFAULT 0,
  emails_found INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for job tracking
CREATE INDEX idx_scraping_jobs_doi ON public.scraping_jobs(doi);
CREATE INDEX idx_scraping_jobs_status ON public.scraping_jobs(status);

-- Enable RLS (Row Level Security) - making data publicly readable for this use case
ALTER TABLE public.author_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is research data)
CREATE POLICY "Allow public read access to author emails" 
  ON public.author_emails 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Allow public read access to scraping jobs" 
  ON public.scraping_jobs 
  FOR SELECT 
  TO public
  USING (true);

-- Create policies for service role to manage data
CREATE POLICY "Allow service role full access to author emails" 
  ON public.author_emails 
  FOR ALL 
  TO service_role
  USING (true);

CREATE POLICY "Allow service role full access to scraping jobs" 
  ON public.scraping_jobs 
  FOR ALL 
  TO service_role
  USING (true);
