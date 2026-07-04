"use client";

import { motion, AnimatePresence, number } from "motion/react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


import {
  Loader2,
  LogOut,
  Monitor,
  Smartphone,
  Square,
  ArrowDown,
  Subtitles,
} from "lucide-react";
import { toast } from "sonner";
import { json } from "stream/consumers";
import Buy from "@/components/buy";
interface metaDataProps {
    title?: string;
    description?: string;
    thumbnail?: string;
    duration?: string;
}

export interface currUserProps {
  id: string;
  name: string;
  email?: string;
  is_premium: boolean;
  curr_clips: number;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

const Editor = () => {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [url , setUrl] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:00");
  const [thumbNailUrl , setThumbNailUrl] = useState<string | null>(null);
  const [isMetaDataLoading , setIsMetaDataLoading] = useState(false);
  const [metaData , setMetaData] = useState<metaDataProps>({});
  const [cropRatio, setCropRatio] = useState<
    "original" | "vertical" | "square"
  >("original");
  const [formats, setFormats] = useState<{format_id: string, label: string}[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [addSubs, setAddSubs] = useState(false);
  // const [downloadCount, setDownloadCount] = useState(0);
  const [userId , setUserId] = useState<string>("");
  const [currUser , setCurrUser] = useState<currUserProps| null>(null);
  const [showPremiumModal , setShowPremiumModal] = useState(false);
  const [currclipCount , setCurrClipCount] = useState<number| null>(null);

  const resolutionOptions = {
    original: { icon: <Monitor className="w-4 h-4" />, label: "Original" },
    vertical: { icon: <Smartphone className="w-4 h-4" />, label: "Vertical" },
    square: { icon: <Square className="w-4 h-4" />, label: "Square" },
  } as const;


  
  useEffect(() => {
    const getUser = async () => {
      const { // this is actually the auth user 
        data: { user },
      } = await supabase.auth.getUser();

      console.log("inside the user" , user);
    
      if(user){
        setUser(user);
        setUserId(user.id);
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  useEffect(()=> {
    const getUserDetails = async() => {
       const {data , error } = await supabase
       .from("users").select("*").eq("id"  , userId).single() as {data : currUserProps | null , error : any};
       if(error){
         console.log("error in fetching the user details" , error.message);
       }
       if(data){
         setCurrUser(data);
         setCurrClipCount(data.curr_clips);
       }
    }
    console.log("userId" , userId);
    getUserDetails();
  } , [userId]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
      console.log("this is my currentClipCount" , currclipCount); 
  } , [currclipCount])



  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  }
  
  function getVideoId(url : string){
    console.log("youtube url" , url);
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    console.log("match" , match);
    return match && match[7].length === 11 ? match[7] : null;
  }

  async function fetchVideoMetaData(videoID : string | null){
      if(!videoID) return;
      setIsMetaDataLoading(true);
      try{
        const url = `https://www.youtube.com/watch?v=${videoID}`;
        const metadataResponse = await fetch(`/api/metadata?url=${url}`);
        if (!metadataResponse.ok) throw new Error("Failed to fetch video metadata");
        const data = await metadataResponse.json();
        console.log("data" , data );  
        setMetaData({
          title : data?.metadata.title , 
          thumbnail : data?.metadata.image , 
          description : data?.metadata.description , 
        }) ;
        setThumbNailUrl(data?.metaData?.image ? data?.metaData?.image :  `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`);

        // formats leftover
        const formatsResponse = await fetch(`/api/formats?url=${encodeURIComponent(url)}`);
        if(formatsResponse.ok){
          const formatData =await formatsResponse.json();
          console.log("formatdata" , formatData);  
          setFormats(formatData?.formats || []);
          if(formatData?.formats.length > 0){
            setSelectedFormat(formatData?.formats[0].format_id);
          }
        }

      }catch(error){
     console.error("Error fetching metadata:", error);
      // Fallback to YouTube thumbnail
        setThumbNailUrl(
          `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`
        );
      }finally{
        setIsMetaDataLoading(false);   
      }
  }

  useEffect(() => {
    const videoID = getVideoId(url);
    if(videoID){
      //immediately show the laoding skeloton 
      console.log("inside the skeleton building block" , videoID);   
      setIsMetaDataLoading(true);
      fetchVideoMetaData(videoID);
    }else {
      setThumbNailUrl(null);
      setMetaData({});
      setFormats([]);
      setSelectedFormat('');
      setIsMetaDataLoading(false);
    }
  } ,  [url]);


  const firstName =
    user?.user_metadata?.name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "User";

  

  
    // before hitting the submit buttom i have to validate something 
    // starttime and endtime 
    // user currentclip count 
    // user ispremium or not 
    //then only do the stuff 

  function timeToSeconds(time : string) : number {
    const [hours , minute , second] = time.split(':').map(Number);
    return hours*3600 + minute*60 + second;
  }
  

  async function handleSubmit(e : React.FormEvent){
    e.preventDefault();
    
    const startSeconds : number = timeToSeconds(startTime);
    const endSeconds : number = timeToSeconds(endTime);
    
    if(startSeconds >= endSeconds){
        toast("Start time should be less than end time");
        return ;
    }
    
    


    if(currUser){
       if(currUser?.curr_clips >= 2 && currUser?.is_premium == false){
            // toast("bhaai upgrade krlee");
            setShowPremiumModal(true);
            
            return // comment this line 
            // one more validation  like you can clip only 2 free clips 
       }

       setLoading(true);
       try{
          // user may tweak browser 
          // check the premium thing on the nextjs server also
          const clickOffclipp = await fetch("api/clip" , {
            method : "POST" , 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url , 
              startTime , 
              endTime , 
              cropRatio , 
              Subtitles : addSubs , 
              formatId : selectedFormat , 
              userId:userId , 
            })
          }) 

          if(!clickOffclipp.ok){
            const errJson = await clickOffclipp.json().catch(() => ({}));
            throw new Error(errJson.error || "Failed to start processing");
          }

          // console.log("hellooo worldl");
          const { id } = (await clickOffclipp.json()) as { id: string };
          console.log("id" , id); 
          // start pooling 
          type jobStatus = 'pending' | 'processing' | 'completed' | 'failed';
          interface jobsStatusResponse {
            status : jobStatus , 
            error?:string , 
            url?:string , 
          }
          let status : jobStatus = "processing";
          while(status === "processing" || status === "pending"){ 
                await new Promise((resolve) => {
                  setTimeout(() => {
                    resolve("true");
                  }, 3000);
                }); // pool or wait for 3 second
               
                const pollRes = await fetch( `api/clip/${id}`);
                if (!pollRes.ok) throw new Error("Failed to poll job status");
                const pollJson = (await pollRes.json()) as jobsStatusResponse;
                status = pollJson.status;
                if (status === "failed") throw new Error(pollJson.error || "Processing failed");
                console.log("status right now" , status); 
          }
          
          const downloadRes = await fetch(`api/clip/${id}/download`);
          if(!downloadRes.ok){
             throw new Error("Failed to download clip");
          }

          const blob = await downloadRes.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = "clip.mp4";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          a.remove();


          // increament the download count in db also
          // make an api call update the download count

          const response = await fetch("/api/clipcount", {
            method: "POST",
          });

          if (!response.ok) {
            console.log("Failed to update clip count");
          }
          else {
            console.log("Clip count updated");
            setCurrClipCount((prev) => (prev ?? 0)+1);
            setCurrUser((prev) => {
              if (prev === null) return null;

              return {
                ...prev,
                curr_clips: prev.curr_clips + 1
              };
            });
          }


       }catch(error){ 
          console.error("Error in handleSubmit:", error);
       }finally{
         setLoading(false);
       }
    }
  }
  
  useEffect(() => {
    console.log("currUser" , currUser); 
  } , [currUser]);

  

  return (
    <main className="flex flex-col w-full h-full min-h-screen p-4 gap-4 max-w-3xl mx-auto items-center justify-center">
      <nav className="flex flex-col w-full gap-4 fixed top-0 left-0 right-0 z-20">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex justify-between items-start">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
              className="font-medium rounded-full border py-2 bg-card px-4 cursor-pointer hover:bg-card/50"
            >
              {loading ? "Loading..." : `👋 Hey, ${firstName}!`}
            </motion.button>

            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="destructive"
                size="icon"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </motion.span>
          </div>
        </div>
      </nav>
      

       <section className="flex flex-col w-full gap-4 max-w-xl mx-auto transition-all duration-300">
        <AnimatePresence mode="wait">
          {!isMetaDataLoading && thumbNailUrl === null ? (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-2xl lg:text-3xl font-medium tracking-tight text-center mx-auto"
            >
              What do you wanna clip?
            </motion.h1>
          ) : isMetaDataLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 h-full w-fit mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4 bg-muted/50 p-2 rounded-lg items-center">
                <div className="w-20 h-[45px] bg-muted animate-pulse rounded-md" />
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 h-full w-fit mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4 bg-muted/50 p-2 rounded-lg md:items-center">
                {thumbNailUrl && (
                  <Image
                    unoptimized
                    width={1280}
                    height={720}
                    src={thumbNailUrl}
                    alt="Video thumbnail"
                    className="w-20 object-cover aspect-video rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes("maxresdefault")) {
                        target.src = target.src.replace(
                          "maxresdefault",
                          "hqdefault"
                        );
                      }
                    }}
                  />
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-lg line-clamp-1">
                    {metaData.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



          <motion.form
          p-4="true" initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-12 border  bg-card rounded-3xl p-4"
          >

          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              id="url"
              placeholder="Paste video url here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-transparent border-none outline-none w-full"
            />
            <Button type="submit" size="icon" disabled={loading}>
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowDown className="w-6 h-6" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-3 w-full items-center">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="startTime" className="sr-only">
                  Start Time
                </Label>
                <Input
                  type="text"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:00:00"
                  required
                  className="font-mono text-sm"
                />
              </div>
              <span className="text-sm text-muted-foreground">to</span>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="endTime" className="sr-only">
                  End Time
                </Label>
                <Input
                  type="text"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:00:00"
                  required
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="cropRatio" className="sr-only">
                Crop Ratio
              </Label>
              <div className="flex items-center justify-between p-2 rounded-2xl border relative bg-white/5 backdrop-blur-md">
               {Object.entries(resolutionOptions).map(
                  ([key, { icon, label }]) => (
                    <div
                      key={key}
                      onClick={() => setCropRatio(key as typeof cropRatio)}
                      className="relative cursor-pointer w-full group text-center py-1.5 overflow-visible hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.175, 0.885, 0.32, 1.275)] px-4"
                    >
                      {cropRatio === key && (
                        <motion.div
                          layoutId="hover"
                          className="absolute inset-0 bg-primary rounded-md"
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 10,
                            mass: 0.2,
                            ease: [0, 1, 0.35, 0],
                          }}
                        />
                      )}
                      <span
                        className={`relative flex text-xs sm:text-sm items-center gap-2 justify-center ${
                          cropRatio === key
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {icon}
                        <span>{label}</span>
                      </span>
                    </div>
                  )
                )} 
              </div> 
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="quality">Quality</Label>
                <select
                  id="quality"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-transparent border rounded-md p-2 h-10 flex items-center appearance-none bg-no-repeat bg-right bg-[length:16px] pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center'
                  }}
                  disabled={formats.length === 0}
                >
                  {formats.length === 0 ? (
                    <option value="">Loading formats...</option>
                  ) : (
                    formats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.label}
                      </option>
                    ))  
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="subtitles-switch">Subtitles</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    id="subtitles-switch"
                    checked={addSubs}
                    onCheckedChange={setAddSubs}
                  />
                  <Label htmlFor="subtitles-switch" className="text-sm text-muted-foreground">
                    English only
                  </Label>
                </div>
              </div>
            </div>
          </div>

        </motion.form>



        <AnimatePresence mode="wait">
          {(currclipCount ?? 0 ) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-4 text-sm text-muted-foreground"
            >
              🔥 {currclipCount} banger{(currclipCount ?? 0) > 1 && "s"} clipped
            </motion.div>
          )}
        </AnimatePresence>
       </section>
       
      {
        showPremiumModal && (<Buy open={showPremiumModal} onOpenChange={setShowPremiumModal}/>)
      } 
    </main>
  );
};

export default Editor;

// leftover 
// check the user is premium or not from the baclend 
// check the currclipcount from the baclend 
// useeffect 
