use crate::Label;
use ureq;
use serde::{Deserialize, Serialize};
use serde_json::{self};

const ONEAI_KEY: &str = "464f5c42-ef71-4fe2-a92b-1ca0b3e8c18b";


#[derive(Serialize,Deserialize,Debug)]
pub struct DatesOutput{
    pub text : String,
    pub labels : Vec<Label>,
}

#[derive(Serialize,Deserialize,Debug)]
pub struct DatesDetection {
   pub input_text: String,
   pub status: String,
   pub output : Vec<DatesOutput>
}

pub fn get_dates_from_text(arg:String) -> Result<DatesDetection,&'static str>{

	let resp = ureq::post("https://api.oneai.com/api/v0/pipeline")
        .set("api-key", ONEAI_KEY)
        .set("Content-type","application/json")
        .send_json(json!({
            "input": arg,
            "input_type":"article",
            "steps": [ {"skill":"numbers"}],
        })).unwrap();


    
    match resp.status() {
        200 => {
            println!("Success");
            let str_response = resp.into_string().unwrap();
            println!("{:#?}",&str_response );
    
            let parsed_object : DatesDetection = serde_json::from_str(&str_response).unwrap();
           Ok(parsed_object)
        },
        _ =>{
            return Err("Error getting response from API");
        }
    }    

}