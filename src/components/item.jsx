import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const Item = ({ title, text, desc, ...rest }) => {
  return (
    <Box p={5} shadow="md" borderWidth="2px" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{text}</Text>
    </Box>
  );
};

export default Item;
