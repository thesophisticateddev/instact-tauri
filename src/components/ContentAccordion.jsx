import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  VStack,
  Text,
  Container,
  Heading,
} from "@chakra-ui/react";

const ContentAccordion = ({ id, text, source, process }) => {
  const getTitle = (str) => {
    const limit = 40;
    if (str.length > limit) {
      return str.slice(0, limit).concat("....");
    }
    return str;
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
        <Container padding={8} >
          <Text>{text}</Text>
          <Box>
            <Heading fontSize={'sm'}>Source:</Heading>
            <Text>{source}</Text>
            <Text>{process}</Text>
          </Box>
        </Container>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ContentAccordion;
