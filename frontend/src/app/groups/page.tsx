/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId;

  return (
    <div>
      <h1>Group Detail Page</h1>
      <p>Group ID: {groupId}</p>
      <p>This page is under construction.</p>
    </div>
  );
}