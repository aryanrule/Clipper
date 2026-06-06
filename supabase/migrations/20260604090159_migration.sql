CREATE EXTENSION IF NOT EXISTS "pgcrypto";


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
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    clip_limit INTEGER NOT NULL DEFAULT 2,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);









