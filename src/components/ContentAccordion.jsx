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
  Badge,
} from "@chakra-ui/react";

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

  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
  };
  console.log("Current theme", theme);

  const getListOfNames = (list) => {
    return list.filter((x) => x.name === "PERSON").map((x) => x.value);
  };
  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {getTitle(text)}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={5}>
        <Container padding={8}>
          <Text>{text}</Text>
          <Divider border="1px solid gray" />
          <Box borderBottom="3px" borderColor="gray.500">
            <Heading fontSize={"sm"}>Source:</Heading>
            <Text>{source}</Text>
            <Text>{process}</Text>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading fontSize={"sm"}>Names</Heading>
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
            <Heading>Dates</Heading>
            <UnorderedList listStyleType="none">
              {dates.map((eachItem) => {
                return (
                  <ListItem className="listStyle">{eachItem.value}</ListItem>
                );
              })}
            </UnorderedList>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading>Locations</Heading>
            <UnorderedList listStyleType="none">
              {names
                .filter(
                  (x) =>
                    x.name === "LOCATION"
                )
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
