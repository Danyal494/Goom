'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModel from './MeetingModel'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { toast } from 'sonner'
import { Textarea } from '../ui/textarea'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { Input } from '../ui/input'
const MeetingTypeList = () => {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const router = useRouter();
  
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    links: ''
  });
  
  const [callDetails, setCallDetails] = useState<Call>();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();
  
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

  const createMeeting = async () => {
    if (!client || !user) return;

    try {
      if (!values.dateTime) {
        toast.error('Please select date and time');
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create call');

      const startAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant meeting';

      await call.getOrCreate({
        data: {
          starts_at: startAt,
          custom: { description }
        }
      });

      setCallDetails(call); // now callDetails is set
      toast.success('Meeting Created');

    } catch (error) {
      console.log(error);
      toast.error('Failed to create call meeting');
    }
  };

  // 🛠️ Important: Handle redirection separately after call is created
  React.useEffect(() => {
    if (callDetails && meetingState === 'isInstantMeeting') {
      router.push(`/meeting/${callDetails.id}`);
    }
  }, [callDetails, meetingState, router]);
  return (
   <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
   <HomeCard img="/icons/add-meeting.svg" title="New Meeting" description="Start an meeting" handleClick={() => setMeetingState('isInstantMeeting')}  className='bg-orange-1'/>
   <HomeCard img="/icons/schedule.svg" title="Schedule Meeting" description="Plan your meeting" handleClick={() => setMeetingState('isScheduleMeeting')} className='bg-blue-1'/>
   <HomeCard img="/icons/recordings.svg" title="View Recording" description="Check out your recording" handleClick={() => router.push('/recording')} className='bg-purple-1'/>
   <HomeCard img="/icons/join-meeting.svg" title="Join Meeting" description="via invitation link" handleClick={() => setMeetingState('isJoiningMeeting')} className='bg-yellow-1'/>

{!callDetails ?  <MeetingModel isOpen={meetingState === 'isScheduleMeeting'} onClose={()=>setMeetingState(undefined)} title="Create Meeting"  handleClick={createMeeting} >
  <div className='flex flex-col gap-2.5'>
<label className='text-base text-normal leading-[22px] text-sky-2' >Add a discription</label>
<Textarea className='border-none focus-visible:ring-0 bg-dark-3 focus-visible:ring-offset-0' onChange={(e)=>{setValues({...values,description:e.target.value})}}/>
  </div>
  <div className='flex flex-col w-full gap-2.5'><label className='text-base text-normal leading-[22px] text-sky-2' >Select Date and Time</label>
  <DatePicker selected={values.dateTime} onChange={(date)=> setValues({...values,dateTime:date!})} showTimeSelect timeCaption='time' timeIntervals={15} dateFormat="MMMM d, yyy h:mm aa" timeFormat='HH:mm' className='w-full bg-dark-3 p-2 focus:outline-none'/></div>
</MeetingModel> : (
    <MeetingModel isOpen={meetingState === 'isScheduleMeeting'} onClose={()=>setMeetingState(undefined)} title=" Meeting Created " className="text-center" buttonText="Copy Meeting Link" buttonIcon='/icons/copy.svg' image='/icons/checked.svg' handleClick={()=>{
      navigator.clipboard.writeText(meetingLink)
      toast.success("Link copied")
    }} />
)}

   <MeetingModel isOpen={meetingState === 'isInstantMeeting'} onClose={()=>setMeetingState(undefined)} title="Start Instant Meeting" className="text-center" buttonText="Join Meeting" handleClick={createMeeting} />
    
   <MeetingModel isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.links)}>
       <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, links: e.target.value })}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
   </MeetingModel>
   </section>
  )
}

export default MeetingTypeList