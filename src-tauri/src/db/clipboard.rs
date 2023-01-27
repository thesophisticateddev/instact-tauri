
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct Clipboard {
   pub id: i32,
   pub message: String,
   pub current_window: String,
   pub process: String,
}

pub struct ClipboardRepository{
    pub database:String,
}

impl ClipboardRepository{

    pub fn init(&self) -> Result<()>{
        let conn = Connection::open(&self.database)?;
        println!("Database connected successfully");
        let res = conn.execute(
            "CREATE TABLE if not exists clipboard (
                id    INTEGER PRIMARY KEY,
                message  TEXT,
                current_window VARCHAR(300),
                process VARCHAR(250)
            )",
            (), // empty list of parameters.
        )?;
        println!("Init status {}",res);

        Ok(())
    }
    pub fn count_all(&self) -> Result<i32>{
        let conn = Connection::open(&self.database)?;
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM clipboard")?;
        let mut rows = stmt.query([])?;
        let mut count:i32 = 0;
        while let Ok(Some(result_row)) = rows.next(){
            count = result_row.get(0)?;
        }
        Ok(count)
    }
    pub fn add(&self, data: &Clipboard) -> Result<()>{
        let conn = Connection::open(&self.database)?;
        
          conn.execute("INSERT INTO clipboard (message, current_window, process) VALUES (?1,?2,?3)",
          &[&data.message, &data.current_window, &data.process])?;
          Ok(())
    }

    pub fn find_all(&self) -> Result<Vec<Clipboard>>{
        let conn = Connection::open(&self.database)?;
        let mut stmt = conn.prepare("SELECT * FROM clipboard")?;
        let mut rows = stmt.query([])?;

        let mut data = Vec::new();

        while let Ok(Some(result_row)) = rows.next() {
            let row = result_row;
            data.push(Clipboard {
                id: row.get(0)?,
                message: row.get(1)?,
                current_window: row.get(2)?,
                process: row.get(3)?
            });
        }
       Ok(data)
    }


    pub fn find_all_pagination(&self, page:i32, limit:i32) -> Result<Vec<Clipboard>>{
        let conn = Connection::open(&self.database)?;
        let mut data = Vec::new();
        if page < 0 || limit <= 0 {
            return Ok(data)
        }
        let offset = page * limit;
        let mut stmt = conn.prepare("SELECT * FROM clipboard LIMIT ?1 , ?2")?;
        let mut rows = stmt.query(&[&offset,&limit])?;

       

        while let Ok(Some(result_row)) = rows.next() {
            let row = result_row;
            data.push(Clipboard {
                id: row.get(0)?,
                message: row.get(1)?,
                current_window: row.get(2)?,
                process: row.get(3)?
            });
        }
       Ok(data)
    }

    pub fn deleted_by_id(&self, id: &i32) -> Result<()>{
        let conn = Connection::open(&self.database)?;       
        conn.execute("DELETE FROM clipboard WHERE id = ?1",&[&id])?;
        Ok(())
    }

    pub fn delete_all(&self) -> Result<()>{
        let conn = Connection::open(&self.database)?;
        conn.execute("DELETE FROM clipboard",[])?;
        Ok(())
    }
}