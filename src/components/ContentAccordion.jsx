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
          <Divider border="1px solid gray" />
          <Box borderBottom="2px" borderColor="gray.500">
            <Heading fontSize={"small"}>Source:</Heading>
            <Text fontSize={"small"}>{source}</Text>
            <Text fontSize={"small"} fontStyle={"italic"}>{process}</Text>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading><span className="greenBadge">Person</span></Heading>
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
            <Heading><span className="orangeBadge">Date</span></Heading>
            <UnorderedList listStyleType="none">
              {dates.map((eachItem) => {
                return (
                  <ListItem className="listStyle">{moment(eachItem.value).format("MMM DD, YYYY hh:mm A")}</ListItem>
                );
              })}
            </UnorderedList>
          </Box>
          <Divider border="1px solid gray" />
          <Box>
            <Heading><span className="purpleBadge">Locations</span></Heading>

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
