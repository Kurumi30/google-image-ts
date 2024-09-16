type Options = {
  query?: Record<string, string>
  userAgent?: string
}

interface IResults {
  url: string
  height: number
  width: number
}

const REGEX = /\["(\bhttps?:\/\/[^"]+)",(\d+),(\d+)\],null/g

const unicodeToString = (content: string): string => content.replace(
  /\\u[\dA-F]{4}/gi,
  match => String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
)

export async function googleImage(
  searchTerm: string,
  options: Options = {}
) {
  // if (!searchTerm || typeof searchTerm !== "string") throw new TypeError("O termo de pesquisa precisa ser uma string!")
  if (typeof options !== "object") throw new TypeError("As opções têm que ser um objeto!")

  const { query, userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" } = options

  const body = await fetch(
    `http://www.google.com/search?${new URLSearchParams({ ...query, udm: "2", tbm: "isch", q: searchTerm })}`,
    {
      headers: {
        "User-Agent": userAgent,
      },
    }
  )
    .then(res => res.text())
    .catch(err => { throw new Error(err) })

  const content = body.slice(body.lastIndexOf("ds:1"), body.lastIndexOf("sideChannel"))
  const results: IResults[] = []

  let result: RegExpExecArray | null

  while (result = REGEX.exec(content)) {
    results.push({
      url: unicodeToString(result[1]),
      height: +result[2],
      width: +result[3],
    })
  }
  
  return results
}
