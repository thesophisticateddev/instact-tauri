import { ChakraProvider, Text } from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/tauri";
import React, { useRef, useState} from "react";

const history = () => {
  const [data, setData] = useState([]);
  const currentPage = useRef(0);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const getContent = () => {
    setLoading(true);
    const isClient = typeof window !== "undefined";
    return (
      isClient &&
      invoke("get_all_content", {
        pageData: { page: currentPage.current, limit: 5 },
      })
        .then((res) => {
          setLoading(false);
          setData([...data, ...res.data]);
          setTotalPage(res.count);
        })
        .catch((err) => console.log(err))
    );
  };

  return (
    <ChakraProvider>
      <Text>history</Text>
    </ChakraProvider>
  );
};

export default history;
