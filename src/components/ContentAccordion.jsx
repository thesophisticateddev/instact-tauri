import { React, useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import moment from "moment/moment";
import axios from "axios";

const ContentAccordion = ({ id, text, source, process }) => {
  const [finalText, setFinalText] = useState(text);

  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
  };

  useEffect(() => {
    formatData();
  }, []);

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

    Promise.all(promises).then((responses) => {
      const labels = [...responses[0].data.output.map((x) => x.labels)[0]].sort(
        (x, y) => x.span[0] > y.span[0]
      );
      let domElements = [];
      let processingText = text;

      console.log("labels", labels);

      for (let i = 0; i < labels.length; i++) {
        switch (labels[i].name) {
          case "PERSON": {
            domElements.push(
              <span className="greenBadge">
                <strong>PERSON</strong>:
              </span>
            );
            break;
          }
          case "GEO":
          case "LOCATION": {
            domElements.push(
              <span className="purpleBadge" locationToolTip>
                <strong>LOCATION:</strong>
              </span>
            );
            break;
          }
          case "DATE":
          case "TIME":
          case "DATETIME": {
            domElements.push(
              <Tooltip
                label={moment(labels[i].data?.date_time).format(
                  "MMM DD, YYYY hh:mm A"
                )}
              >
                <span className="orangeBadge">
                  <strong> Date & Time </strong>
                </span>
              </Tooltip>
            );
          }
        }

        if (i == 0) {
          domElements.push(
            <span>
              {processingText.substring(labels[i].span[0], labels[i].span[1])}
            </span>
          );
          processingText = processingText.substring(labels[i].span[1]);
        } else {
          const value = labels[i].span_text;
          const startIndex = processingText.indexOf(value);
          const endIndex = startIndex + value.length;
          domElements.push(
            <span>{processingText.substring(startIndex, endIndex) + " "}</span>
          );
          processingText = processingText.substring(endIndex + 1);
        }
        domElements.push(<span>{processingText}</span>);
      }
      console.log(domElements);
      setFinalText(domElements);
    });
  };

  return (
    <AccordionItem mt={8} mb={8}>
      <AccordionButton fontSize={"small"} fontWeight={"bold"}>
        <Box flex="1" textAlign="left">
          {getTitle(text)}
        </Box>
        <AccordionIcon />
      </AccordionButton>

      <AccordionPanel pb={5}>
        <Container padding={8}>
          <Text fontSize={"small"}>{finalText}</Text>
          <Divider border="1px solid gray" />
          <Box borderBottom="2px" borderColor="gray.500">
            <Heading fontSize={"small"}>Capture Source & Time:</Heading>
            <Text fontSize={"small"}>{`${source},  ${new Date()}`}</Text>
            <Text fontSize={"small"} fontStyle={"italic"}>
              {process}
            </Text>
          </Box>
          <Divider border="1px solid gray" />
        </Container>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ContentAccordion;
