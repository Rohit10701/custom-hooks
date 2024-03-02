"use client";
import InfiniteSearchSelect from "@/components/InfiniteSearchSelect";
import React, { useEffect, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

type Props = {};

const Page = (props: Props) => {
  // function to add more entries
  // const addEntries = function (): any[] {
  //   const elements = Array.from(Array(10)).fill(Math.random());
  //   return elements;
  // };

  // const addEntries = function (page?: number, itemPerPage?: number): any {
  //   const elements = Array.from(Array(itemPerPage)).map(() => ({
  //     key: Math.random(),
  //     value: Math.random(),
  //     id: Math.random().toString(), // Use a unique identifier for id
  //   }));
  //   console.log(page);
  //   return {
  //     options: elements,
  //     hasMore: true,
  //     page: page,
  //   };
  // };

  const addEntries = async (page?: number, itemPerPage? : number)=> {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users?page=${page}&limit=${itemPerPage}`);
      const data = await res.json();
  
      const elements = data.map((entry : any) => ({
        key: entry.name,
        value: entry.email,
        id: entry.id
      }));
  
      return {
        options: elements,
        hasMore: true,
        page: page,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {
        options: [],
        hasMore: false,
        page: page,
      };
    }
  };

  const searchFunction = async (
    args?: string,
  ) => {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/${args}`);
      if(res.ok){
        const data = await res.json();
    
        const elements = data.map((entry : any) => ({
          key: entry.title,
          value: entry.completed,
          id: entry.id
        }));
    
        return {
          options: elements,
        };
      }
      else{
        console.error("Error fetching data");
      return {
        options: [],
      };
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return {
        options: [],
      };
    }
  };

  const [textInput, setTextInput] = useState("");
  
  const textSetterFunction = (value : any) => {
    setTextInput(value)
  } 
  
  const renderOption = (option : any) => (
    <div>
      <strong>{option.id}</strong>: {option.key}
    </div>
  );
  console.log(textInput);

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <InfiniteSearchSelect
        optionFunction={addEntries}
        searchFunction={searchFunction}
        textInput={textInput}
        setTextInput={textSetterFunction}
        customDropdownIcon={<RiArrowDropDownLine />}
        pageForSelect = {1}
        itemPerPageForSelect = {20}
        renderOption={renderOption}
        // multiple= {true}
        // renderPill={renderOption}
      />
    </div>
  );
};

export default Page;

