import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";
import tauriLogo from "../assets/tauri.svg";
import { emit, listen } from "@tauri-apps/api/event";
import { VStack, HStack, StackDivider, Container } from "@chakra-ui/react";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import Item from "../components/item";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [listenerState, setListenerState] = useState(false);
  const [listenerButtonText, setListenerButtonText] =
    useState("Start Listener");
  const [name, setName] = useState("");
  const [list, setList] = useState([{ id: 0, text: "something here" }]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  async function startListener() {
    await invoke("clipboard_listener_service");
  }

  listen("list-updated", (event) => {
    //TODO: render some components here or something
    console.log("Event occured", event);
    console.log("obj", event.payload);
    console.log("list before", list);
    list.push({ id: event.payload.count, text: event.payload.message });
    // setList([...list, { id:event.payload.count, text:event.payload.message }]);
    setList(list);
    console.log("list after", list);
  });

  async function dispatchNotification(title, body) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      // sendNotification("Tauri is awesome!");
      sendNotification({ title, body, icon: "../assets/tauri.svg" });
    }
  }

  return (
    <Container className="">
      <h1>Welcome to Tauri!</h1>

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

      <HStack className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </HStack>
      <HStack className="row">
        <button
          type="button"
          onClick={() => {
            if (!listenerState) {
              startListener();
              setListenerState(true);
              setListenerButtonText("Stop Listener");
            }
          }}
        >
          {listenerButtonText}
        </button>
        <button
          type="button"
          onClick={() =>
            dispatchNotification("Hello From Tauri", "New text was copied")
          }
        >
          Emit Notification
        </button>
      </HStack>

      <p>{greetMsg}</p>
      <VStack
        divider={<StackDivider borderColor="gray" />}
        spacing={4}
        align="stretch"
      >
        <ul>
          {list.map((item) => (
            <li key={item.id}>
              <Item
                text={item.text}
                title={`Content`}
                desc={`Copied from desktop`}
              />
            </li>
          ))}
        </ul>
      </VStack>
    </Container>
  );
}

export default App;
