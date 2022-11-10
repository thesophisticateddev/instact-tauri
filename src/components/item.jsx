import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const Item = ({ title, text, source, ...rest }) => {
  return (
    <Box p={5} shadow="md" borderWidth="2px" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{text}</Text>
      <Box>
        <Heading fontSize="medium">Source: </Heading>
      <Text>{source}</Text>
      </Box>
     
    </Box>
  );
};

export default Item;
