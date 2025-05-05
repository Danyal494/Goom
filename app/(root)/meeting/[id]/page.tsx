'use client';

import Loader from '@/components/common-elem/Loader';
import MeetingRoom from '@/components/common-elem/MeetingRoom';
import MeetingSetup from '@/components/common-elem/MeetingSetup';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import React, { use, useState } from 'react';

const Meeting = ({
  params,
}: {
  params: Promise<{ id: string }>; // notice: params is a Promise now
}) => {
  const { id } = use(params); // use() will unwrap the promise

  const { user, isLoaded } = useUser();

  const [isSetupComplete,setIsSetupComplete] = useState(false)

  const {call,isCallLoading} = useGetCallById(id)

  if (!isLoaded || isCallLoading) {
    return <Loader/>; // Optional: handle loading state
  }

  return (
    <main className='h-screen w-full'>
      <StreamCall call={call}>
        <StreamTheme>
{!isSetupComplete ? (<MeetingSetup setIsSetupComplete={setIsSetupComplete} />) : (<MeetingRoom/>)}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default Meeting;
