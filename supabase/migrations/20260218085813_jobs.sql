CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  storage_path TEXT,
  file_path TEXT , 
  public_url TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() , 
  
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);


-- interface jobsStatus {
--     id : string , 
--     status : string , 
--     userId : string  , 
--     public_url? : string , 
--     storage_path? : string  , 
--     file_path?:string , 
--     error?:string , 
-- } 
