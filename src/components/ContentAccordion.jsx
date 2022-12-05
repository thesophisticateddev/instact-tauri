import { React, useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  VStack,
  Divider,
  Text,
  Container,
  Heading,
  UnorderedList,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import moment from "moment/moment";

const ContentAccordion = ({
  id,
  text,
  source,
  process,
  dates,
  names,
  currentTheme,
}) => {
  const [theme, setTheme] = useState(currentTheme);
  const [finalText, setFinalText] = useState(text);
  const [finalTextName, setFinalTextName] = useState(text);
  const [finalTextLocation, setFinalTextLocation] = useState(text);

  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
  };

  useEffect(() => {
    const formattedNames = getFormattedNamesText(text, names);

    setFinalText(formattedNames);

    const formattedLocations = getFormattedLocationsText(formattedNames, names);

    setFinalText(formattedLocations);

    const formattedDates = getFormattedDatesText(formattedLocations, dates);

    setFinalText(formattedDates);
  });

  const getFormattedNamesText = (textString, nameList) => {
    const listOfNames = nameList
      .filter((x) => x.name === "PERSON")
      .map((x) => x.span_text);
    listOfNames.forEach((name) => {
      const indexOfName = textString.indexOf(name);
      textString =
        textString.substring(0, indexOfName) +
        `<strong>PERSON</strong>: ${name}` +
        textString.substring(
          indexOfName + name.length + 1,
          textString.length
        );
    });
    // const data = textString.split(" ").map((word) => {
    //   let string = word;
    //   listOfNames.map((name) => {
    //     if (word.includes(name) || name.includes(word)) {
    //       string = `<strong>PERSON</strong>: ${word}`;
    //     }
    //   });
    //   return string;
    // });
    return textString;
  };

  const getFormattedLocationsText = (textString, locationList) => {
    const listOfNames = locationList
      .filter((x) => x.name === "GEO")
      .map((x) => x.value);

    const data = textString.split(" ").map((word) => {
      let string = word;
      listOfNames.map((name) => {
        if (word.includes(name)) {
          string = `<strong>LOCATION ${word}</strong> `;
        }
      });

      return string;
    });

    return data.join(" ");
  };

  const getFormattedDatesText = (textString, datesList) => {
    datesList.forEach((eachItem) => {
      const indexOfDate = textString.indexOf(eachItem.span_text);
      textString =
        textString.substring(0, indexOfDate) +
        `<strong>DATE & TIME: </strong> ${eachItem.span_text} <i>${moment(
          eachItem.value
        ).format("MMM DD, YYYY hh:mm A")}</i> ` +
        textString.substring(
          indexOfDate + eachItem.span_text.length + 1,
          textString.length
        );
    });

    return textString;
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
          <Text fontSize={"small"}>{text}</Text>
          <Text fontSize={"small"}>
            <div dangerouslySetInnerHTML={{ __html: finalText }}></div>
          </Text>
          <Divider border="1px solid gray" />
          <Box borderBottom="2px" borderColor="gray.500">
            <Heading fontSize={"small"}>Source:</Heading>
            <Text fontSize={"small"}>{source}</Text>
            <Text fontSize={"small"} fontStyle={"italic"}>
              {process}
            </Text>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading>
              <span className="greenBadge">Person</span>
            </Heading>
          </Box>
          <Box>
            <UnorderedList listStyleType="none">
              {names
                .filter((x) => x.name === "PERSON")
                .map((x) => (
                  <ListItem className={"listStyle"}>
                    <Text color="green" borderRadius="4px" variant="solid">
                      Found!
                    </Text>
                    {x.value}
                  </ListItem>
                ))}
            </UnorderedList>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading>
              <span className="orangeBadge">Date</span>
            </Heading>
            <UnorderedList listStyleType="none">
              {dates.map((eachItem) => {
                return (
                  <ListItem className="listStyle">
                    {moment(eachItem.value).format("MMM DD, YYYY hh:mm A")}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading>
              <span className="purpleBadge">Locations</span>
            </Heading>

            <UnorderedList listStyleType="none">
              {names
                .filter((x) => x.name === "LOCATION")
                .map((x) => (
                  <ListItem className={"listStyle"}>
                    <Text color="green" borderRadius="4px" variant="solid">
                      Found!
                    </Text>
                    {x.value}
                  </ListItem>
                ))}
            </UnorderedList>
          </Box>
        </Container>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ContentAccordion;
