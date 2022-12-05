use std::{collections::HashMap};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize,Deserialize,Debug,Clone)]
pub struct Label{
   pub skill:String,
   pub name:String,
   pub value:String,
   pub data: HashMap<String,Option<Value>>,
   pub span_text: String
}