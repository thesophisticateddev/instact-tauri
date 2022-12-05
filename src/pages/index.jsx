import { useCallback, useEffect, useState, Button } from "react";
import { invoke } from "@tauri-apps/api/tauri";
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

  useEffect(() => {
    console.log("list ", list);
  }, [list]);


  // create a new webview window and emit an event only to that window
  useEffect(() => {
    const unlisten = listen("list-updated", (event) => {
      // console.log("obj", event.payload);
      // console.log("list before", list);
      let temp = {
        id: event.payload.count,
        text: event.payload.message,
        source: event.payload.current_window,
        process: event.payload.process,
        names: event.payload.names_detected,
        dates: event.payload.dates_detected,
      };
      dispatchNotification("Copied text saved to clipboard", temp.text);

      setList((prevList) => [...prevList, temp].reverse()); //simple value

      console.log("list after", list);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  async function dispatchNotification(title, body) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      // sendNotification("Tauri is awesome!");
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
      <VStack
        divider={<StackDivider borderColor="gray" />}
        spacing={4}
        align="stretch"
      >
        <Center padding={"25px"}>
          <Text fontSize="small">Welcome to Instact, the app that analyzes your clipboard
            content in real-time. Simply copy some text from anywhere
            on this device. We will list that text below and annotates it
            with business intelligence found. Give it a try and it is free.Tutorial FAQ
          </Text>
        </Center>
        <Accordion defaultIndex={[0]} allowMultiple>
          {list.map((item) => {
            return (
              <ContentAccordion
                text={item.text}
                source={item.source}
                process={item.process}
                dates={item.dates}
                names={item.names}
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
