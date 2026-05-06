{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Bold;\f1\froman\fcharset0 Times-Roman;\f2\fmodern\fcharset0 Courier;
\f3\froman\fcharset0 Times-Italic;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
{\*\listtable{\list\listtemplateid1\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid1\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid1}
{\list\listtemplateid2\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid101\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid2}
{\list\listtemplateid3\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid201\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid3}
{\list\listtemplateid4\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid301\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid4}
{\list\listtemplateid5\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat0\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid401\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid5}
{\list\listtemplateid6\listhybrid{\listlevel\levelnfc0\levelnfcn0\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{decimal\}}{\leveltext\leveltemplateid501\'01\'00;}{\levelnumbers\'01;}\fi-360\li720\lin720 }{\listname ;}\listid6}
{\list\listtemplateid7\listhybrid{\listlevel\levelnfc0\levelnfcn0\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{decimal\}}{\leveltext\leveltemplateid601\'01\'00;}{\levelnumbers\'01;}\fi-360\li720\lin720 }{\listname ;}\listid7}
{\list\listtemplateid8\listhybrid{\listlevel\levelnfc0\levelnfcn0\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{decimal\}}{\leveltext\leveltemplateid701\'01\'00;}{\levelnumbers\'01;}\fi-360\li720\lin720 }{\listname ;}\listid8}}
{\*\listoverridetable{\listoverride\listid1\listoverridecount0\ls1}{\listoverride\listid2\listoverridecount0\ls2}{\listoverride\listid3\listoverridecount0\ls3}{\listoverride\listid4\listoverridecount0\ls4}{\listoverride\listid5\listoverridecount0\ls5}{\listoverride\listid6\listoverridecount0\ls6}{\listoverride\listid7\listoverridecount0\ls7}{\listoverride\listid8\listoverridecount0\ls8}}
\paperw11900\paperh16840\margl1440\margr1440\vieww28260\viewh13900\viewkind0
\deftab720
\pard\pardeftab720\sa321\partightenfactor0

\f0\b\fs48 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Snapwise: Master Architecture & Build Blueprint (v1.5)\
\pard\pardeftab720\sa298\partightenfactor0

\fs36 \cf0 1. System Overview & Context for AI Agents\
\pard\pardeftab720\sa240\partightenfactor0

\fs24 \cf0 Goal:
\f1\b0  Build "Snapwise," a bespoke, AI-powered photography operations and franchise management platform. 
\f0\b Architecture:
\f1\b0  Hierarchical Multi-Tenancy (Enterprise -> Franchise/Tenancy -> Profiles). Total data isolation is required via Supabase Row-Level Security (RLS). 
\f0\b Tech Stack:
\f1\b0  * 
\f0\b Frontend:
\f1\b0  Next.js, Tailwind CSS (Follow 
\f2\fs26 DESIGN.md
\f1\fs24  for styling, primary theme: 
\f2\fs26 #8806bc
\f1\fs24 ).\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls1\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Backend:
\f1\b0  Supabase (PostgreSQL, Auth, Edge Functions).\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Calendar Sync:
\f1\b0  Nylas or Cronofy (2-way sync).\
\ls1\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Payments:
\f1\b0  Stripe Billing (Webhooks for subscription active/referral credits).\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 2. Database Schema & RLS Architecture\
\pard\pardeftab720\sa280\partightenfactor0

\fs28 \cf0 A. Hierarchical Tenancy & Profiles\
\pard\pardeftab720\partightenfactor0

\f2\b0\fs26 \cf0 CREATE TABLE enterprises (\
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\
  name TEXT NOT NULL,\
  global_branding_color TEXT DEFAULT '#8806bc',\
  created_at TIMESTAMPTZ DEFAULT NOW()\
);\
\
CREATE TABLE tenancies (\
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\
  enterprise_id UUID REFERENCES enterprises(id) NOT NULL,\
  name TEXT NOT NULL,\
  local_pricing_multiplier FLOAT DEFAULT 1.0,\
  stripe_subscription_id TEXT,\
  stripe_status TEXT,\
  created_at TIMESTAMPTZ DEFAULT NOW()\
);\
\
CREATE TABLE profiles (\
  id UUID PRIMARY KEY REFERENCES auth.users(id),\
  tenancy_id UUID REFERENCES tenancies(id) NOT NULL,\
  is_enterprise_admin BOOLEAN DEFAULT false,\
  role TEXT CHECK (role IN ('franchise_owner', 'admin', 'photographer')),\
  full_name TEXT,\
  email TEXT\
);\
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 B. Core Jobs & Asset Tracking\
\pard\pardeftab720\partightenfactor0

\f2\b0\fs26 \cf0 CREATE TABLE jobs (\
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\
  tenancy_id UUID REFERENCES tenancies(id) NOT NULL,\
  agent_id UUID REFERENCES profiles(id),\
  photographer_id UUID REFERENCES profiles(id),\
  status TEXT DEFAULT 'pending',\
  address TEXT NOT NULL,\
  coordinates GEOGRAPHY(POINT),\
  boundary_image_url TEXT,\
  start_time TIMESTAMPTZ,\
  end_time TIMESTAMPTZ,\
  upload_buffer_end TIMESTAMPTZ,\
  requires_drone BOOLEAN DEFAULT false,\
  requires_tide BOOLEAN DEFAULT false\
);\
\
CREATE TABLE job_assets (\
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\
  job_id UUID REFERENCES jobs(id) NOT NULL,\
  tenancy_id UUID REFERENCES tenancies(id) NOT NULL,\
  asset_name TEXT NOT NULL,\
  status TEXT DEFAULT 'missing' CHECK (status IN ('missing', 'received', 'promised')),\
  notes TEXT, -- For AI extraction (e.g., "Agent will send Friday")\
  file_url TEXT\
);\
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 C. Row-Level Security (Strict Isolation)\
\pard\pardeftab720\sa240\partightenfactor0

\fs24 \cf0 CRITICAL INSTRUCTION FOR AI:
\f1\b0  All operational tables (
\f2\fs26 jobs
\f1\fs24 , 
\f2\fs26 job_assets
\f1\fs24 , 
\f2\fs26 profiles
\f1\fs24 ) MUST have RLS enabled ensuring 
\f2\fs26 tenancy_id
\f1\fs24  isolation. Example:\
\pard\pardeftab720\partightenfactor0

\f2\fs26 \cf0 ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;\
\
CREATE POLICY "Strict Franchise Isolation for Jobs" \
ON jobs FOR ALL \
USING (tenancy_id = (SELECT tenancy_id FROM profiles WHERE id = auth.uid()));\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 3. Core Logic Rules & Features\
\pard\pardeftab720\sa280\partightenfactor0

\fs28 \cf0 A. The "Paige Rule" (Soft Buffers & Routing)\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls2\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Routing API:
\f1\b0  Use Google Maps Distance Matrix with 
\f2\fs26 duration_in_traffic
\f1\fs24 .\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Math Rule:
\f1\b0  Round actual travel time 
\f3\i up
\f1\i0  to the next 10-minute increment (e.g., 34 mins -> 40 mins).\
\ls2\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 The Buffer:
\f1\b0  Automatically attach a 40-minute "Upload Buffer" block (
\f2\fs26 upload_buffer_end
\f1\fs24 ) to the end of a shoot. This is a "Soft Block." The UI must allow admins to book over it, but trigger a warning: 
\f3\i "This overlaps with an Upload Buffer. Proceed?"
\f1\i0 \
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 B. Asset "Nudge" Queue (Human-in-the-Loop)\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls3\ilvl0
\f1\b0\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Do not send automated asset chaser emails.\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls3\ilvl0
\f0\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Logic:
\f1\b0  24 hours before 
\f2\fs26 start_time
\f1\fs24 , if a required asset status is 
\f2\fs26 missing
\f1\fs24  (NOT 
\f2\fs26 received
\f1\fs24  or 
\f2\fs26 promised
\f1\fs24 ), generate a dashboard alert.\
\ls3\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 UI:
\f1\b0  The alert provides 3 buttons: [Send Template Email], [Mark as Received], [Dismiss].\
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 C. TOTS Mapping (Geography)\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls4\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Fallback:
\f1\b0  If the exact address is unmapped/new subdivision, provide a Google Maps modal to let the Admin drop a pin and save raw Lat/Long coordinates to the 
\f2\fs26 jobs
\f1\fs24  record.\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls4\ilvl0
\f3\i \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 (Note: TOTS GIS API integration for boundary images is slated for Phase 2).
\f1\i0 \
\pard\pardeftab720\sa280\partightenfactor0

\f0\b\fs28 \cf0 D. The Smart Email Sidebar (Human-in-the-Loop AI)\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls5\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Auto-Detect:
\f1\b0  Read the sender's email address and query the database for their active jobs.\
\ls5\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Context UI:
\f1\b0  Present the user with active job addresses to select from (or "Create New").\
\ls5\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 AI Extraction:
\f1\b0  Once a job is selected, use an LLM (e.g., Gemini) to extract: Meeting Points, Property Highlights, Hazards/Access Notes, and Asset Status.\
\ls5\ilvl0
\f0\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Confirmation:
\f1\b0  Present extracted data in a form. User must click [Confirm & Save] to commit to the database.\
\pard\pardeftab720\sa298\partightenfactor0

\f0\b\fs36 \cf0 4. Execution Phases for Antigravity\
\pard\pardeftab720\sa240\partightenfactor0

\fs24 \cf0 Phase 1: Foundation & Security
\f1\b0 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls6\ilvl0\cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	1	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Initialize Next.js project with Tailwind CSS.\
\ls6\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	2	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Initialize Supabase project and execute the SQL schema.\
\ls6\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	3	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Apply RLS policies across all tables.\
\ls6\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	4	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Set up Supabase Auth (Email Invites) restricting user creation to Franchise Admins.\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b \cf0 Phase 2: Core Admin Dashboard
\f1\b0 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls7\ilvl0\cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	1	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Scaffold the UI from the 
\f2\fs26 /mockups
\f1\fs24  folder using 
\f2\fs26 DESIGN.md
\f1\fs24  guidelines.\
\ls7\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	2	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Build the Job Creation & Map/Pin-drop flow.\
\ls7\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	3	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Implement the Google Maps Distance Matrix travel time calculation (rounding up to nearest 10).\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b \cf0 Phase 3: Workflows & AI Assist
\f1\b0 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls8\ilvl0\cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	1	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Build the Asset "Nudge" approval queue.\
\ls8\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	2	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Build the structural UI for the Email Sidebar (Auto-detect -> Context Select -> Form).\
}