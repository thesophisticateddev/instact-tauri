mod dates;
mod names;
pub mod label;
use label::Label;
use dates::get_dates_from_text;
use names::get_names_from_text;

pub fn get_names(text:String) -> Vec<Label>{
    if text.is_empty(){
        // ()
        return vec![];
    }
    println!("task to get data from api");
    let result = get_names_from_text(text);
    
    let data = match result {
      Ok(detection) => {
          let detected_outputs = detection.output;
          let mut all_labels:Vec<Label> = Vec::new();
          for mut fields in detected_outputs{
              all_labels.append(&mut fields.labels);           
          }
          all_labels
      },
      Err(_)=> {
        println!("Error occured could not get data");
        return vec![];
      }
    };
  
    data
   
}

pub fn get_dates(text: String)-> Vec<Label>{
    if text.is_empty(){
        // ()
        return vec![];
    }
    println!("task to get data from api");
    let result = get_dates_from_text(text);
    
    let data = match result {
      Ok(detection) => {
          let detected_outputs = detection.output;
          let mut all_labels:Vec<Label> = Vec::new();
          for mut fields in detected_outputs{
              all_labels.append(&mut fields.labels);           
          }
          all_labels
      },
      Err(_)=> {
        println!("Error occured could not get data");
        return vec![];
      }
    };
  
    data
}