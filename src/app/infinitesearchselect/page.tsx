"use client"
import InfiniteSearchSelect from "@/components/InfiniteSearchSelect";
import React, { useEffect, useState } from "react";

type Props = {};

const Page = (props: Props) => {
  const [items, setItems] = useState<string[]>([]);

  // function to add more entries
  const addEntries = function (): any[] {
    const elements = Array.from(Array(10)).fill(Math.random());
    return elements;
  };

  useEffect(() => {
    setItems(() => addEntries());
  }, []);

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <InfiniteSearchSelect optionFunction={addEntries} />
    </div>
  );
};

export default Page;
