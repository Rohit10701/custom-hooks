"use client";
import {
  ChangeEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  HTMLAttributes,
} from "react";

interface InfiniteSearchSelectProps extends HTMLAttributes<HTMLInputElement> {
  optionFunction: (page?: number, itemPerPage?: number) => any;
  searchFunction?:(args: string, page?: number, itemPerPage?: number) => any;
  textInput: any;
  setTextInput: React.Dispatch<SetStateAction<string>>;
  enableDebounce?: boolean;
  delay?: number;
  customDropdownIcon?: React.ReactNode;
  optionClassName?: string;
  selectClassName?: string;
  optionAreaClassName?: string;
  pageForSelect? : number;
  itemPerPageForSelect?  :number;
  pageForSearch? : number;
  itemPerPageForSearch? : number;
}

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

const InfiniteSearchSelect = ({
  optionFunction,
  searchFunction,
  textInput,
  setTextInput,
  enableDebounce = true,
  delay = 300,
  customDropdownIcon,
  selectClassName = "",
  optionClassName = "",
  optionAreaClassName = "",
  pageForSelect = 1,
  itemPerPageForSelect = 10,
  pageForSearch = 1,
  itemPerPageForSearch = 10,
  ...rest
}: InfiniteSearchSelectProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [optionList, setOptionList] = useState<any[]>([]);
  const optionAreaRef = useRef<HTMLDivElement>(null);
  const { isOutside } = useOutsideClick(optionAreaRef);
  const lastOptionRef = useRef<HTMLLIElement>(null);
  const selectPageRef = useRef(pageForSelect)
  const hasMore = useRef(true)
  useEffect(() => {
    if (!hasMore){
      return;
    }
    const lastOption = lastOptionRef.current
    const options = {
      root: optionAreaRef.current,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(async (entries) => {
      const first = entries[0];
      console.log(entries);
      if (!first.isIntersecting) {
        return;
      }
      const fetchedResult = await optionFunction(selectPageRef.current, itemPerPageForSelect)
      selectPageRef.current = fetchedResult?.page
      setOptionList((value) => {
        return [
          ...value,
          ...fetchedResult?.options,
        ];
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
    setTextInput(option);
    setIsSelected(false);
  };

  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;

    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const debouncedSetTextInput = debounce((value: string) => {
    setTextInput(value);
  }, delay);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSetTextInput(e.target.value);
  };

  return (
    <>
      <div className="inline-block">
        <div className="flex relative">
          <div className="flex flex-col">
            <input
              onChange={
                enableDebounce
                  ? handleTextChange
                  : (e) => setTextInput(e.target.value)
              }
              className={`text-black bg-white ${selectClassName}`}
              value={textInput?.key || textInput}
              {...rest}
            />

            {isSelected && (
              <div
                ref={optionAreaRef}
                className={`h-[100px] overflow-auto absolute w-full ${optionAreaClassName}`}
                style={{ top: "calc(100% + 5px)", left: 0 }}
              >
                <ul>
                  {optionList?.map((option, index) => (
                    <li
                      key={option?.id || index}
                      onClick={() => handleChooseOption(option)}
                      className={`hover:cursor-pointer ${optionClassName}`}
                    >
                      {option?.key || option}
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
              {customDropdownIcon}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfiniteSearchSelect;

// optionFunction -> {key:, value:, id:}[] or []
// placeholder
//
