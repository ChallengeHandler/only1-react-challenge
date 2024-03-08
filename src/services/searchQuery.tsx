import words from './data.json'

const DELAY_PERIOD = 3000;

export type DataType = {
  label: string,
  value: string,
}
type QueryResult = Array<DataType>;
export const searchQuery = async (query: string): Promise<QueryResult> => new Promise(res => {
  const result = words.filter(word => word.label.includes(query))
  setTimeout(() => {
    res(result)
  }, DELAY_PERIOD)
})