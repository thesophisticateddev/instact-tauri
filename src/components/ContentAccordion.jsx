import { React, useState, useEffect, Fragment } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Divider,
  Text,
  Container,
  Heading,
  Tooltip,
  ChakraProvider,
} from "@chakra-ui/react";
import moment from "moment/moment";
import axios from "axios";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

const ContentAccordion = ({ id, text, source, process }) => {
  const [finalText, setFinalText] = useState(text);

  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
  };
  const getFormattedNamesText = (textString, detections) => {
    const listOfNames = detections
      .filter((x) => x.name === "PERSON")
      .map((x) => x.span_text);
    listOfNames.forEach((name) => {
      const indexOfName = textString.indexOf(name);
      textString =
        textString.substring(0, indexOfName) +
        `<span class=greenBadge><strong>PERSON</strong>:</span> ${name} ` +
        textString.substring(indexOfName + name.length + 1, textString.length);
    });
    return textString;
  };
  const getFormattedLocationsText = (textString, locationList) => {
    const listOfNames = locationList
      .filter((x) => x.name === "GEO" || x.name === "LOCATION")
      .map((x) => x.value);
    const data = textString.split(" ").map((word) => {
      let string = word;
      listOfNames.map((name) => {
        if (word.includes(name)) {
          string = `<span class=purpleBadge locationToolTip><strong>LOCATION:</strong></span> ${word} `;
        }
      });

      return string;
    });

    return data.join(" ");
  };
  const getFormattedDatesText = (textString, labels) => {
    const dateList = labels.filter(
      (x) => x.name === "DATE" || x.name === "TIME" || x.name === "DATETIME"
    );

    dateList.forEach((eachItem) => {
      const indexOfDate = textString.indexOf(eachItem.span_text);
      textString =
        textString.substring(0, indexOfDate) +
        `<span class="orangeBadge">
            <span class=toolTipText>${moment(eachItem.value).format(
              "MMM DD, YYYY hh:mm A"
            )}
            </span>
          <strong> Date & Time </strong></span> ${
            eachItem.span_text
          } </Tooltip>` +
        textString.substring(
          indexOfDate + eachItem.span_text.length + 1,
          textString.length
        );
    });

    return textString;
  };

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

  useEffect(() => {
    formatData();
  }, [text]);

  const formatData = async () => {
    let promises = [];
    promises.push(
      axios.post(
        "https://api.oneai.com/api/v0/pipeline",
        {
          input: text,
          input_type: "article",
          steps: [{ skill: "names" }, { skill: "numbers" }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": "464f5c42-ef71-4fe2-a92b-1ca0b3e8c18b",
          },
        }
      )
    );

    Promise.all(promises)
      .then((responses) => {
        const labels = [
          ...responses[0].data.output.map((x) => x.labels)[0],
        ].sort((x, y) => x.span[0] > y.span[0]);
        // let domElements = [];
        // let processingText = text;

        console.log("labels", labels);

        const formattedNames = getFormattedNamesText(text, labels);
        const formattedLocations = getFormattedLocationsText(
          formattedNames,
          labels
        );
        const formattedDates = getFormattedDatesText(
          formattedLocations,
          labels
        );

        // Just iterate through all matches

        // for (let i = 0; i < labels.length; i++) {
        //   switch (labels[i].name) {
        //     case "PERSON": {
        //       domElements.push(
        //         <span className="greenBadge">
        //           <strong>PERSON</strong>:
        //         </span>
        //       );
        //       break;
        //     }
        //     case "GEO":
        //     case "LOCATION": {
        //       domElements.push(
        //         <span className="purpleBadge" locationToolTip>
        //           <strong>LOCATION:</strong>
        //         </span>
        //       );
        //       break;
        //     }
        //     case "DATE":
        //     case "TIME":
        //     case "DATETIME": {
        //       domElements.push(
        //         <Tooltip
        //           label={moment(labels[i].data?.date_time).format(
        //             "MMM DD, YYYY hh:mm A"
        //           )}
        //         >
        //           <span className="orangeBadge">
        //             <strong> Date & Time </strong>
        //           </span>
        //         </Tooltip>
        //       );
        //     }
        //   }

        //   if (i == 0) {
        //     domElements.push(<span>{processingText.substring(0,labels[i].span[0])}</span>)
        //     domElements.push(
        //       <span>
        //         {processingText.substring(labels[i].span[0], labels[i].span[1])}
        //       </span>
        //     );
        //     processingText = processingText.substring(labels[i].span[1]);
        //   } else {
        //     const value = labels[i].span_text;
        //     const startIndex = processingText.indexOf(value);
        //     const endIndex = startIndex + value.length;
        //     domElements.push(
        //       <span>{processingText.substring(startIndex, endIndex) + " "}</span>
        //     );
        //     processingText = processingText.substring(endIndex + 1);
        //   }
        //   domElements.push(<span>{processingText}</span>);
        // }
        // console.log(domElements);

        setFinalText(formattedDates);
      })
      .catch(async (err) => {
        await dispatchNotification(
          "API call failed",
          "Could not detect anything, please check network"
        );
      });
  };

  return (
    <ChakraProvider>
      <AccordionItem mt={8} mb={8}>
        <AccordionButton fontSize={"small"} fontWeight={"bold"}>
          <Box flex="1" textAlign="left">
            {getTitle(text)}
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel pb={5}>
          <Container
            padding={8}
            boxShadow={"rgba(149, 157, 165, 0.2) 0px 8px 24px"}
          >
            <Text fontSize={"small"} pb="5px">
              <span dangerouslySetInnerHTML={{ __html: finalText }}></span>
            </Text>
            <Divider border="1px solid" borderColor="black" />
            <Box borderBottom="2px" borderColor="gray.500" pt="5px">
              <Heading fontSize={"small"} p="5px">
                Capture Source & Time:
              </Heading>
              <Text
                p="5px"
                fontSize={"small"}
              >{`${source},  ${new Date()}`}</Text>
              <Text p="5px" fontSize={"small"} fontStyle={"italic"}>
                {process}
              </Text>
            </Box>
          </Container>
        </AccordionPanel>
      </AccordionItem>
    </ChakraProvider>
  );
};

export default ContentAccordion;
