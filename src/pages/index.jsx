import {  useEffect, useState } from "react";

import Image from "next/image";
import tauriLogo from "../assets/app-icon.png";
import { emit, listen } from "@tauri-apps/api/event";
import {
  VStack,
  StackDivider,
  Container,
  Text,
  Center,
  Accordion,
} from "@chakra-ui/react";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

import ContentAccordion from "../components/ContentAccordion";

function App() {
  const [list, setList] = useState([]);

  // create a new webview window and emit an event only to that window
  useEffect(() => {
    const unlisten = listen("list-updated", (event) => {
      let temp = {
        id: event.payload.count,
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

  const getContent = () =>{
    const data = emit("findAll");
    console.log('get Content data here ===>', data);
  }

  async function dispatchNotification(title, body) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      sendNotification({ title, body, icon: "../../src-tauri/icons/icon.ico" });
    }
  }

  return (
    <Container alignContent="center">
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
      <VStack>
        <button onClick={getContent}>test</button>
      </VStack>
      <VStack
        divider={<StackDivider borderColor="gray" />}
        spacing={4}
        align="stretch"
      >
        <Center padding={"25px"}>
          <Text fontSize="small">
            Welcome to Instact, the app that analyzes your clipboard content in
            real-time. Simply copy some text from anywhere on this device. We
            will list that text below and annotates it with business
            intelligence found. Give it a try and it is free.Tutorial FAQ
          </Text>
        </Center>
        <Accordion defaultIndex={[0]} allowMultiple>
          {list.map((item) => {
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
    </Container>
  );
}

export default App;
