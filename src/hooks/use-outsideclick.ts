import { RefObject, useEffect, useState } from "react";

const useOutsideClick = (ref: RefObject<HTMLDivElement>) => {
    const [isOutside, setIsOutside] = useState<boolean>(false);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
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
  
    return  isOutside ;
  };
export default useOutsideClick;