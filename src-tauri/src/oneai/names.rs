use crate::Label;
use ureq;
use serde::{Deserialize, Serialize};
use serde_json::{self};

const ONEAI_KEY: &str = "464f5c42-ef71-4fe2-a92b-1ca0b3e8c18b";


#[derive(Serialize,Deserialize,Debug)]
pub struct NameOutput{
    pub text : String,
    pub labels : Vec<Label>
}

#[derive(Serialize,Deserialize,Debug)]
pub struct NameDetection {
   pub input_text: String,
   pub status: String,
   pub output : Vec<NameOutput>
}

pub fn get_names_from_text(arg:String) -> Result<NameDetection,&'static str>{
    if arg.is_empty() {
        return Err("Argument string is empty");
    }
	let resp = ureq::post("https://api.oneai.com/api/v0/pipeline")
        .set("api-key", ONEAI_KEY)
        .set("Content-type","application/json")
        .send_json(json!({
            "input": arg,
            "steps": [ {"skill":"names"}],
        }));

    match resp {
        Ok(resp_data) => {
              match resp_data.status() {
                200 => {
                    println!("Success");
                    println!("{:?}",resp_data );
                    let str_response = resp_data.into_string().unwrap();
                    println!("{:#?}",&str_response );
            
                    let parsed_object : NameDetection = serde_json::from_str(&str_response).unwrap();
                   Ok(parsed_object)
                },
                _ =>{
                    return Err("Error getting response from API");
                }
            }    

        },
        _ => return Err("Some error occured while fetching data from API")
    }    
    
  

}



