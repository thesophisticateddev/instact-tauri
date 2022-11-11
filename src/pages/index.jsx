import { useCallback, useEffect, useState, Button } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";
import tauriLogo from "../assets/tauri.svg";
import { emit, listen } from "@tauri-apps/api/event";
import {
  VStack,
  HStack,
  StackDivider,
  Container,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  ChevronDownIcon,
  Center,
  Accordion,
} from "@chakra-ui/react";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import Item from "../components/item";
import ContentAccordion from "../components/ContentAccordion";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    console.log("list ", list);
  }, [list]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  // create a new webview window and emit an event only to that window
  useEffect(() => {
    const unlisten = listen("list-updated", (event) => {
      console.log("Event occured", event);
      console.log("obj", event.payload);
      console.log("list before", list);
      let temp = {
        id: event.payload.count,
        text: event.payload.message,
        source: event.payload.current_window,
        process: event.payload.process,
      };
      dispatchNotification("Copied text saved to clipboard", temp.text);

      setList((prevList) => [...prevList, temp]); //simple value

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
      <h1>Custom Clipboard App</h1>
      <VStack>
        <span className="logos">
          <a href="https://tauri.app" target="_blank">
            <Image
              width={144}
              height={144}
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
          <Heading>Content</Heading>
        </Center>

        {/* <ul>
          {list?.map((item) => {
            console.log("mapping list ==> ", item);
            return (
              <Item
                key={item.id}
                text={item.text}
                source={item.source}
              />
            );
          })}
        </ul> */}
        <Accordion defaultIndex={[0]} allowMultiple>
          {list.map((item) => {
            return (
              <ContentAccordion
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
