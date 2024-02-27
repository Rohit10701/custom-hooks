"use client";
import { RiArrowDropDownLine } from "react-icons/ri";
import { RefObject, useEffect, useRef, useState } from "react";

type Props = {
  optionFunction: () => any[];
};


const useOutsideClick = (ref: RefObject<HTMLDivElement>) => {
  const [isOutside, setIsOutside] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log(ref.current);
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOutside(true);
      } else {
        setIsOutside(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return { isOutside };
};


const InfiniteSearchSelect = ({ optionFunction }: Props) => {
  const [textInput, setTextInput] = useState("");
  const [placeholder, setPlaceholder] = useState("placeholder...");
  const [isSelected, setIsSelected] = useState(false);
  const [isTextInput, setIsTextInput] = useState(true);
  const [optionList, setOptionList] = useState<any[]>([]);

  const optionAreaRef = useRef<HTMLDivElement>(null);
  const { isOutside } = useOutsideClick(optionAreaRef);

  // starting pagination
  const lastOptionRef = useRef<HTMLLIElement>(null);

  useEffect(() => {

    const options = {
      root: optionAreaRef.current,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      console.log(entries)
      if (!first.isIntersecting) {
        return;
      }

      setOptionList((value) => {
        return [...value, ...optionFunction()];
      });
    }, options);

    if (lastOptionRef.current) {
      observer.observe(lastOptionRef.current);
    }

    return () => {
      if (lastOptionRef.current) {
        observer.unobserve(lastOptionRef.current);
      }
    };
  });



  useEffect(() => {
    setOptionList(() => optionFunction());
  }, [optionFunction]);

  useEffect(() => { 
    if (isOutside) {
      setIsSelected(false);
    }
  }, [isOutside]);

  const handleChooseOption = (option: any) => {
    setTextInput(option);
    setIsSelected(false);
  };
  return (
    <>
      <div className="inline-block">
        <div className="flex relative">
          <div className="flex flex-col">
            <input
              onChange={(e) => setTextInput(e.target.value)}
              className="text-black"
              placeholder={placeholder}
              value={textInput}
            />

            {isSelected && (
              <div ref={optionAreaRef} className="h-[100px] overflow-auto">
                <ul>
                  {optionList.map((option, index) => (
                    <li
                      key={index}
                      onClick={() => handleChooseOption(option)}
                      className="hover:cursor-pointer"
                    >
                      {option}
                    </li>
                  ))}
                  <li
                    key={"lastelementofoption"}
                    className=""
                    ref={lastOptionRef}
                  ></li>
                </ul>
              </div>
            )}
          </div>

          {!isSelected && (
            <div
              className="absolute right-0 text-black text-2xl hover:cursor-pointer"
              onClick={() => setIsSelected(!isSelected)}
            >
              <RiArrowDropDownLine />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfiniteSearchSelect;
