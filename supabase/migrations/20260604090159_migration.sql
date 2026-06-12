CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- // for now take this as a supabase grunt and after you complete your project then make a new migration file and push to the remote 

-- // jobstatus schema for the micro-backend only 
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  storage_path TEXT,
  file_path TEXT,
  public_url TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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


CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    curr_clips INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);











