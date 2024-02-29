"use client";
import { useDebounce } from "@/hooks/use-debounce";
import useOutsideClick from "@/hooks/use-outsideclick";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  HTMLAttributes,
} from "react";

interface InfiniteSearchSelectProps extends HTMLAttributes<HTMLInputElement> {
  optionFunction: (page?: number, itemPerPage?: number) => any;
  searchFunction?: (args: string) => any;
  textInput: any;
  setTextInput: (value: any) => any;
  delay?: number;
  customDropdownIcon?: React.ReactNode;
  optionClassName?: string;
  selectClassName?: string;
  optionAreaClassName?: string;
  pillAreaClassName? : string;
  pillClassName? :string;
  pageForSelect?: number;
  itemPerPageForSelect?: number;
  multiple?: boolean;
  renderOption?: (option: any) => React.ReactNode;
  renderPill? :(option: any) => React.ReactNode;
}

const dropdownArrowSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    id="chevron-down"
  >
    <path d="M12,15a1,1,0,0,1-.71-.29l-4-4A1,1,0,0,1,8.71,9.29L12,12.59l3.29-3.29a1,1,0,0,1,1.41,1.41l-4,4A1,1,0,0,1,12,15Z"></path>
  </svg>
);

const InfiniteSearchSelect = ({
  optionFunction,
  searchFunction,
  textInput,
  setTextInput,
  delay = 300,
  customDropdownIcon,
  selectClassName = "",
  optionClassName = "",
  optionAreaClassName = "",
  pillAreaClassName = "",
  pillClassName = "",
  pageForSelect = 1,
  itemPerPageForSelect = 10,
  multiple = false,
  renderOption,
  renderPill,
  ...rest
}: InfiniteSearchSelectProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [optionList, setOptionList] = useState<any[]>([]);
  const [searchList, setSearchList] = useState<any[]>([]);
  const [debouncedInput, setDebouncedInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  const optionAreaRef = useRef<HTMLDivElement>(null);
  const isOutside = useOutsideClick(optionAreaRef);
  const lastOptionRef = useRef<HTMLLIElement>(null);
  const selectPageRef = useRef(pageForSelect);
  const hasMore = useRef(true);

  useEffect(() => {
    if (!hasMore) {
      return;
    }
    const lastOption = lastOptionRef.current;
    const options = {
      root: optionAreaRef.current,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(async (entries) => {
      const first = entries[0];
      if (!first.isIntersecting) {
        return;
      }
      const fetchedResult = await optionFunction(
        selectPageRef.current,
        itemPerPageForSelect
      );
      selectPageRef.current = fetchedResult?.page;
      setOptionList((value) => {
        return [...value, ...fetchedResult?.options];
      });
    }, options);

    if (lastOption) {
      observer.observe(lastOption);
    }

    return () => {
      if (lastOption) {
        observer.unobserve(lastOption);
      }
    };
  });

  useEffect(() => {
    if (isOutside) {
      setIsSelected(false);
    }
  }, [isOutside]);

  const handleChooseOption = (option: any) => {
    if (multiple && isSelected) {
      setSelectedOptions((prevOptions) => {
        const isSelected = prevOptions.some((o) => o.id === option.id);
        return isSelected
          ? prevOptions.filter((o) => o.id !== option.id)
          : [...prevOptions, option];
      });
    } else {
      setTextInput(option);
      setIsSelected(false);
      setIsSearch(false);
    }
  };

  const handleDeletePill = (option : any) => {
    const filterdOptions = selectedOptions.filter(item => item !== option)
    setSelectedOptions(filterdOptions)
    setTextInput(filterdOptions)
  }

  const debounceValue = useDebounce(debouncedInput, delay);

  useEffect(() => {
    const fetchSearchDetials = async () => {
      if (searchFunction) {
        const searchValue = await searchFunction(debounceValue);
        setSearchList(searchValue?.options);
      }
    };
    fetchSearchDetials();
  }, [searchFunction, debounceValue]);


  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentText = e.target.value;

    if (currentText !== "") {
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }
    !isSelected && setDebouncedInput(currentText);
    setTextInput(currentText);
  };

  return (
    <>
      <div className="inline-block">
        <div className="flex relative justify-center items-center">
          <div className="flex flex-col">
            <input
              onChange={handleTextChange}
              className={`text-black bg-white ${selectClassName} h-[40px] rounded-sm pl-3`}
              value={(!multiple && isSearch) ? (textInput?.key || textInput) : ""}
              {...rest}
            />

            {isSelected && (
              <div
                ref={optionAreaRef}
                className={`h-[100px] overflow-auto absolute w-full bg-white rounded-sm pt-1 text-black z-20 ${optionAreaClassName}`}
                style={{ top: "calc(100% + 5px)", left: 0 }}
              >
                <ul>
                  {optionList?.map((option, index) => (
                    <li
                      key={option?.id || index}
                      onClick={() => handleChooseOption(option)}
                      className={`hover:cursor-pointer hover:bg-blue-400 rounded-sm px-[10px] py-[1px] mx-[5px] ${
                        selectedOptions?.some(
                          (selectedOption) => selectedOption.id === option.id
                        )
                          ? "bg-blue-400"
                          : ""
                      } ${optionClassName}`}
                    >
                      {renderOption
                        ? renderOption(option)
                        : option?.key || option}
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

            {selectedOptions.length > 0 && (
              <div
                className={`h-[100px] overflow-auto absolute w-full rounded-sm pt-1 text-black z-10 ${pillAreaClassName}`}
                style={{ top: "calc(100% + 5px)", left: 0 }}
              >
                <div className="flex flex-wrap gap-x-1 gap-y-2">
                  {selectedOptions?.map((option, index) => (
                    <span
                      key={option?.id || index}
                      onClick={() => handleDeletePill(option)}
                      className={`hover:cursor-pointer rounded-sm px-[10px] py-[1px] mx-[5px] inline-block bg-blue-400 ${optionClassName}`}
                    >
                      {renderOption
                        ? renderOption(option)
                        : option?.key || option}
                    </span>
                  ))}
                </div>
              </div>
            )}


            
            {isSearch && (
              <div
                className={`h-[100px] overflow-auto absolute w-full bg-white rounded-sm pt-1 text-black ${optionAreaClassName}`}
                style={{ top: "calc(100% + 5px)", left: 0 }}
              >
                <ul>
                  {searchList?.map((search, index) => (
                    <li
                      key={search?.id || index}
                      onClick={() => handleChooseOption(search)}
                      className={`hover:cursor-pointer hover:bg-blue-400 rounded-sm px-[10px] py-[1px] mx-[5px] ${optionClassName}`}
                    >
                      {renderOption
                        ? renderOption(search)
                        : search?.key || search}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!isSelected && (
            <div
              className="absolute right-0 text-black text-2xl hover:cursor-pointer flex justify-center items-center w-[40px] h-[40px] bg-white"
              onClick={() => {
                setIsSelected(!isSelected),
                  setTextInput(""),
                  setIsSearch(false);
              }}
            >
              {customDropdownIcon || dropdownArrowSVG}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfiniteSearchSelect;
