// import { FC, useState } from 'react'
// import { useQuery } from '@tanstack/react-query'

import { useRef, useState, KeyboardEvent, ChangeEvent, MouseEvent } from 'react'
import { DataType, searchQuery } from '../services/searchQuery'

type QueryFunction = (query: string) => Promise<Array<DataType>>
type OnChangeFunction = (value: DataType) => void


// interface AutoCompleteProps {
//   queryFn: QueryFunction
// }

// const AutoComplete: FC<AutoCompleteProps> = ({ queryFn }) => {
//   const { isPending, error, data, isFetching } = useQuery({
//     queryKey: ['repoData'],
//     queryFn: () => queryFn('df')
//   })
//   return <></>
// }


const KEY_CODES = {
    "DOWN": 40,
    "UP": 38,
    "PAGE_DOWN": 34,
    "ESCAPE": 27,
    "PAGE_UP": 33,
    "ENTER": 13,
}
function useAutoComplete({ delay = 500, source, onChange }: { delay: number, source: QueryFunction, onChange: OnChangeFunction }) {
    const [myTimeout, setMyTimeOut] = useState(setTimeout(() => { }, 0))
    const listRef = useRef<HTMLUListElement>(null)
    const [suggestions, setSuggestions] = useState<DataType[]>([])
    const [isBusy, setBusy] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [textValue, setTextValue] = useState("")

    function delayInvoke(cb: () => void) {
        if (myTimeout) {
            clearTimeout(myTimeout)
        }
        setMyTimeOut(setTimeout(cb, delay));
    }

    function selectOption(index: number) {
        if (index > -1) {
            onChange(suggestions[index])
            setTextValue(suggestions[index].label)
        }
        clearSuggestions()
    }

    async function getSuggestions(searchTerm: string) {
        if (searchTerm && source) {
            const options = await source(searchTerm)
            setSuggestions(options)
        }
    }

    function clearSuggestions() {
        setSuggestions([])
        setSelectedIndex(-1)
    }

    function onTextChange(searchTerm: string) {
        setBusy(true)
        setTextValue(searchTerm)
        clearSuggestions();
        delayInvoke(() => {
            getSuggestions(searchTerm)
            setBusy(false)
        });
    }


    const optionHeight = listRef?.current?.children[0]?.clientHeight

    function scrollUp() {
        if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
        if (listRef.current != undefined && optionHeight != undefined) {
          listRef.current.scrollTop -= optionHeight
        }
    }

    function scrollDown() {
        if (selectedIndex < suggestions.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
        if (listRef.current != undefined && optionHeight != undefined) {
          listRef.current.scrollTop = selectedIndex * optionHeight
        }
    }

    function pageDown() {
        setSelectedIndex(suggestions.length - 1)
        if (listRef.current != undefined && optionHeight != undefined) {
          listRef.current.scrollTop = suggestions.length * optionHeight
        }
    }

    function pageUp() {
        setSelectedIndex(0)
        if (listRef.current != undefined) {
          listRef.current.scrollTop = 0
        }
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        const keyOperation = {
            [KEY_CODES.DOWN]: scrollDown,
            [KEY_CODES.UP]: scrollUp,
            [KEY_CODES.ENTER]: () => selectOption(selectedIndex),
            [KEY_CODES.ESCAPE]: clearSuggestions,
            [KEY_CODES.PAGE_DOWN]: pageDown,
            [KEY_CODES.PAGE_UP]: pageUp,
        }
        if (keyOperation[e.keyCode]) {
            keyOperation[e.keyCode]()
        } else {
            setSelectedIndex(-1)
        }
    }

    return {
        bindOption: {
            onClick: (e: MouseEvent<HTMLLIElement>) => {
              if (listRef.current != undefined) {
                let nodes = Array.from(listRef.current.children);
                const node = (e.target as HTMLElement).closest("li");
                if (node != null) {
                  selectOption(nodes.indexOf(node))
                }
              }
            }
        },
        bindInput: {
            value: textValue,
            onChange: (e: ChangeEvent<HTMLInputElement>) => onTextChange(e.target.value),
            onKeyDown
        },
        bindOptions: {
            ref: listRef
        },
        isBusy,
        suggestions,
        selectedIndex,
    }
}

const Options = [
  { value: "1", label: "John" },
  { value: "2", label: "Jack" },
  { value: "3", label: "Jane" },
  { value: "4", label: "Mike" },
]

export default function AutoComplete() {

   const { bindInput, bindOptions,  bindOption, isBusy, suggestions, selectedIndex} = useAutoComplete({
      onChange: value => console.log(value),
      source: (search) => searchQuery(search),
      delay: 500
  })

     return (
      <div className="p-2 border" >
          <div className="flex items-center w-full">
              <input
                  placeholder='Search'
                  className="flex-grow px-1 outline-none"
                  {...bindInput}
              />
              {isBusy && <div className="w-4 h-4 border-2 border-dashed rounded-full border-slate-500 animate-spin"></div>}
          </div>
          <ul {...bindOptions} className="w-[300px] scroll-smooth absolute max-h-[260px] overflow-x-hidden overflow-y-auto" >
              {
                  suggestions.map((_, index) => (
                      <li
                          className={`flex items-center h-[40px] p-1 hover:bg-slate-300 ` + (selectedIndex === index && "bg-slate-300")}
                          key={index}
                          {...bindOption}
                      >
                          <div className="flex items-center space-x-1">
                              <div>{suggestions[index].label}</div>
                          </div>
                      </li>
                  ))
              }
          </ul>
      </div>
  )
}