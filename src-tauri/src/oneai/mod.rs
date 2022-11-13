use reqwest;
use std::collections::HashMap;

const ONEAI_KEY: &str = "464f5c42-ef71-4fe2-a92b-1ca0b3e8c18b";

// pub fn get_names_from_text(arg: String) ->Result<HashMap<String, String>, Box<dyn std::error::Error>> {
// 	let mut body = HashMap::new();
// 	body.insert("input",arg);
// 	 let resp = reqwest::blocking::get("https://httpbin.org/ip")?
//         .json::<HashMap<String, String>>()?;
//     println!("{:#?}", resp);
//     Ok(resp)
// }


pub fn get_names_from_text(arg:String) {

	let mut body = HashMap::new();
	body.insert("input",arg);
	body.insert("skills",String::from(" [\r\n      {\r\n        \"skill\": \"names\"\r\n      }   \r\n    ]"));
	let client = reqwest::blocking::Client::new();

	let resp = client.post("https://api.oneai.com/api/v0/pipeline")
	.header("api_key",ONEAI_KEY)
	.header("accept","application/json")
	.json(&body).send();
	 
	println!("Result {:#?}",resp);

}

