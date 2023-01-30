import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

import Image from "next/image";
import tauriLogo from "../assets/app-icon.png";
import {
  VStack,
  StackDivider,
  Container,
  Text,
  Center,
  Accordion,
  Button,
  ChakraProvider,
  Divider,
  useToast,
  Box,
} from "@chakra-ui/react";



import ContentAccordion from "../components/ContentAccordion";

function App() {
  const [list, setList] = useState([]);
  const toast = useToast({
    duration: 2000,
    position: "top-right",
    isClosable: true,
  });

  // create a new webview window and emit an event only to that window
  useEffect(() => {
    const unlisten = listen("list-updated", (event) => {
      let temp = {
        id: event.payload.id,
        text: event.payload.message,
        source: event.payload.current_window,
        process: event.payload.process,
      };
      dispatchNotification("Copied text saved to clipboard", temp);
      setList((prevList) => [...prevList, temp].reverse()); //simple value
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

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

  const deleteData = () => {
    const isClient = typeof window !== "undefined";
    return (
      isClient &&
      invoke("delete_all_content")
        .then((res) => {
          setData([]);
          currentPage.current = 0;
          toast({
            title: "Successful!",
            description: "Notification deleted.",
            status: "success",
          });
        })
        .catch((err) => console.log(err))
    );
  };

  async function dispatchNotification(title, body) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      sendNotification(title);
      sendNotification({ title, body, icon: "../../src-tauri/icons/icon.ico" });
    }
  }

  const testNewWindow = () => {
    invoke("create_history_window")
      .then((res) => console.log("Window started"))
      .catch((err) => console.error(err));
  };

  return (
    <ChakraProvider>
      <Container alignContent="center" w="100%" h="100%" bg="white">
        <VStack>
          <span className="logos">
            <a href="https://instact.ai" target="_blank">
              <Image
                width={400}
                height={120}
                src={tauriLogo}
                className="logo tauri"
                alt="Tauri logo"
              />
            </a>
          </span>
        </VStack>

        <VStack
          divider={<StackDivider borderColor="gray" />}
          spacing={4}
          align="stretch"
        >
          <Center>
            <Button onClick={testNewWindow}>Click me</Button>
          </Center>
          <Center pt={"25px"}>
            <Text fontSize="small">
              Welcome to Instact, the app that analyzes your clipboard content
              in real-time. Simply copy some text from anywhere on this device.
              We will list that text below and annotates it with business
              intelligence found. Give it a try and it is free.Tutorial FAQ
            </Text>
          </Center>
          <Accordion defaultIndex={[0]} allowMultiple>
            {list?.map((item) => {
              return (
                <ContentAccordion
                  key={`COPIED-TEXT-${item.id}`}
                  text={item.text}
                  source={item.source}
                  process={item.process}
                  id={item.id}
                />
              );
            })}
          </Accordion>
        </VStack>
        <Divider border="1px solid" borderColor="red" />
        <Box pt="10px" pb="10px">
          <Button
            size="sm"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              getContent();
              currentPage.current += 1;
            }}
          >
            View History
          </Button>
        </Box>
        {data.length > 0 && (
          <Box pt="10px" pb="10px" pl="85%">
            <Button
              size="sm"
              colorScheme="red"
              mr={3}
              onClick={() => {
                deleteData();
              }}
            >
              Clear
            </Button>
          </Box>
        )}
        {data.map((item) => (
          <Box key={item.id}>
            <>
              <Text>
                <strong>ID: </strong>
                {item.id}
              </Text>
              <Text>
                <strong>Message: </strong>
                {item.message}
              </Text>
              <Text>
                <strong>Process: </strong>
                {item.process}
              </Text>
              <Divider border="1px solid" borderColor="black" />
            </>
          </Box>
        ))}
        {currentPage.current < totalPage / 5 && data.length > 0 && (
          <Box pt="10px" pb="10px" pl="43%">
            <Button
              isLoading={loading}
              loadingText="Loading"
              size="sm"
              colorScheme="blue"
              mr={3}
              onClick={() => {
                getContent();

                currentPage.current += 1;
              }}
            >
              {/* Load More */}
              {loading ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}
      </Container>
    </ChakraProvider>
  );
}

export default App;
