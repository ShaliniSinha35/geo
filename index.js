const express = require("express");
const mysql = require("mysql");
const app = express();
const port = process.env.PORT || 3001; // Corrected the case of 'PORT'
const bodyParser = require("body-parser");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs= require('fs')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); 

app.use('/upload', express.static(path.join(__dirname, 'upload/')));
app.use('/upload', express.static(path.join(__dirname,'upload/app/')));


function getCurrentDateTime() {
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  let hours = ("0" + date_time.getHours()).slice(-2);
  let minutes = ("0" + date_time.getMinutes()).slice(-2);
  let seconds = ("0" + date_time.getSeconds()).slice(-2);
  let cdate_time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  return cdate_time;
}


const connection = mysql.createPool({
  host: "137.59.53.229",
  user: "pmksybihar_geolocation_user",
  password: "e?S=XJHZI@ij",
  database:"pmksybihar_geolocation_db"
});





function handleDisconnect() {
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to MySQL');
    
      connection.release();
    }
  });

}

handleDisconnect();



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   

  
   
    const uploadPath = path.join(__dirname,'..', 'upload', 'app');
    
  
  

    // Check if the subfolder exists; if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Save the file with its original name
    cb(null, file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only certain file types (e.g., images)
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});


app.post('/geo/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const imageUrl = `${req.protocol}://${req.get('X-Forwarded-Host') || req.get('host')}/upload/app/${req.file.filename}`;
  console.log(imageUrl);


  return res.status(200).json({ imageUrl: imageUrl });
});



app.get("/geo/district",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_block` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

           
            res.json(results);
          }
        }
      );
})


app.get("/geo/block",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_block` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

          
            res.json(results);
          }
        }
      );
})



app.get("/geo/panchayat",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_panchayat` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            
            res.json(results);
          }
        }
      );
})



app.get("/geo/village",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_village` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

         
            res.json(results);
          }
        }
      );
})


app.get("/geo/projectArea",(req,res)=>{

  const project_id = req.query.project_id

  const sql = "SELECT  `project_id`, `name` FROM `master_project_area` WHERE project_id = ?";

  connection.query(sql, [project_id], function (err, result) {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      // console.log("Query result:", result);
      return res.send(result);
    }
  });

   
})



app.get("/geo/activity",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_activity_type` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

        
            res.json(results);
          }
        }
      );
})


app.get("/geo/activityName",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_activity` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

          
            res.json(results);
          }
        }
      );
})


app.get("/geo/verify", (req, res) => {
  const empId = req.query.empId; // Corrected variable name
  const password = req.query.password; // Corrected variable name
  // console.log("Employee ID:", empId, password);


  

  const sql = 'SELECT * FROM employee WHERE emp_id = ? AND password = ?';
  connection.query(sql, [empId, password], function (err, result) {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      // console.log("Query result:", result);
      return res.send(result);
    }
  });
});

// app.post("/geo/addProject", (req, res) => {
//   const { emp_id, dist, block, panchayat, village,farmer_name, projectArea, activityType, activityName, imageArray,desc,workid,length,breadth,height } = req.body;

// const cdate_time=getCurrentDateTime()
//   console.log("226",req.body)
// console.log("imageArray",imageArray)

     


//   const sqlInsertProject = `INSERT INTO project_detail 
//                             (emp_id, dist, block, panchayat, village, farmer_name, project_area, activity_type, activity_name,workid,length,breadth,height,entry_date,status) 
//                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?, ?,'Active')`;

//   connection.query(sqlInsertProject, [emp_id, dist, block, panchayat, village, farmer_name, projectArea, activityType, activityName,workid,length,breadth,height,cdate_time], (err, result) => {
//     if (err) {
//       console.error('Error inserting project data:', err);
//       res.status(500).send('Error inserting project data into database');
//       return;
//     }

//     const projectId = result.insertId;


//     const pid = `PR000${projectId}`;

//     const sqlUpdateProject = `UPDATE project_detail 
//                               SET pid = ? 
//                               WHERE id = ?`;

//     connection.query(sqlUpdateProject, [pid, projectId], (updateErr, updateResult) => {
//       if (updateErr) {
//         console.error('Error updating project pid:', updateErr);
//         res.status(500).send('Error updating project data in database');
//         return;
//       }


      
//     const imageInsertPromises = imageArray.map(async (image) => {
//       const { uri, latitude, longitude, dateTime } = image;


//        const imgUri= `Img${workid}.jpg`

//       const sqlInsertImage = `INSERT INTO image_detail 
//                               (emp_id, pid, url, lat, longitude, description, date_time) 
//                               VALUES (?, ?, ?, ?, ?, ?, ?)`;

//         connection.query(sqlInsertImage, [emp_id, pid, imgUri, latitude, longitude, desc, cdate_time],(imageErr,imageResult)=>{
//          if(imageErr){
//           console.error('Error updating image pid:', imageErr);
//           res.status(500).send('Error updating image data in database');
//           return;
//          }

//       });
//     });

//       console.log('Project data inserted and pid updated successfully!');
//       res.status(200).send(workid);
//       // res.json({ message: "insertion successful", pid:pid });
//     });
//   });
// });

app.post("/geo/addProject", async (req, res) => {
  const {
    emp_id, dist, block, panchayat, village, farmer_name, projectArea,
    activityType, activityName, imageArray, desc, workid, length, breadth, height
  } = req.body;

  const cdate_time = getCurrentDateTime();
  console.log("226", req.body);
  console.log("imageArray", imageArray);

  const sqlInsertProject = `INSERT INTO project_detail 
                            (emp_id, dist, block, panchayat, village, farmer_name, project_area, activity_type, activity_name, workid, length, breadth, height, entry_date, status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'Active')`;

  try {
    // Insert project details
    const projectResult = await new Promise((resolve, reject) => {
      connection.query(sqlInsertProject, [emp_id, dist, block, panchayat, village, farmer_name, projectArea, activityType, activityName, workid, length, breadth, height, cdate_time], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const projectId = projectResult.insertId;
    const pid = `PR000${projectId}`;

    // Update project pid
    await new Promise((resolve, reject) => {
      const sqlUpdateProject = `UPDATE project_detail 
                                SET pid = ? 
                                WHERE id = ?`;

      connection.query(sqlUpdateProject, [pid, projectId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Insert images
    await Promise.all(imageArray.map((image, index) => {
      const { uri, latitude, longitude, dateTime } = image;
      const imgUri = `Img${workid}_${index + 1}.jpg`;

      const sqlInsertImage = `INSERT INTO image_detail 
                              (emp_id, pid, url, lat, longitude, description, date_time) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)`;

      return new Promise((resolve, reject) => {
        connection.query(sqlInsertImage, [emp_id, pid, imgUri, latitude, longitude, desc, cdate_time], (imageErr, imageResult) => {
          if (imageErr) {
            reject(imageErr);
          } else {
            resolve(imageResult);
          }
        });
      });
    }));

    console.log('Project data inserted and pid updated successfully!');
    res.status(200).send(workid);

  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).send('An error occurred while processing the request');
  }
});



app.get("/geo/allProjects", (req, res) => {
  const empId = req.query.empId; 
  console.log("289 Employee ID:", empId);


  

  const sql = 'SELECT * FROM `project_assign` WHERE emp_id = ?';
  connection.query(sql, [empId], function (err, result) {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      console.log("Query result:", result);
      return res.send(result);
    }
  });
});


app.get("/geo/projectAssign", (req, res) => {
  const empId = req.query.empId; 
  console.log("289 Employee ID:", empId);


  

  const sql = 'SELECT * FROM `project_assign` WHERE emp_id = ? && status = "Active" ';
  connection.query(sql, [empId], function (err, result) {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      console.log("Query result:", result);
      return res.send(result);
    }
  });
});




app.get("/geo/projectDetails", (req, res) => {
  const empId = req.query.empId;

  console.log("Employee ID:", empId);

  const sql = `
    SELECT pd.id AS project_id,
           pd.emp_id,
           pd.dist,
           pd.block,
           pd.panchayat,
           pd.village,
           pd.project_area,
           pd.activity_type,
           pd.activity_name,
           id.url AS image_url,
           id.lat AS image_lat,
           id.longitude AS image_longitude,
           id.description AS image_description,
           id.date_time AS image_date_time
    FROM project_detail pd
    INNER JOIN image_detail id ON pd.pid = id.pid
    WHERE pd.emp_id = ?
  `;


  
  connection.query(sql, [empId], (err, result) => {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      console.log("Query result:", result);
      return res.send(result);
    }
  });
});


app.get("/geo/districtAssign",(req,res)=>{
  const did = req.query.did;

  console.log(did)

  const sql = 'SELECT * FROM `master_district` WHERE did = ? ';
  connection.query(sql, [did], function (err, result) {

        if (err) {
          console.log(err);
        } else {

         
          res.json(result);
        }
      }
    );
})




app.get("/geo/work",(req,res)=>{
  const activityId = req.query.activityId;
  const projectId = req.query.projectId;
  const districtId = req.query.districtId;
  console.log(projectId,districtId)

console.log(activityId)
  const sql = 'SELECT  `workid` FROM `master_workid` WHERE activity = ? && project = ? && district_id = ? ';
  connection.query(sql, [activityId,projectId,districtId], function (err, result) {

        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      }
    );
})



app.get("/geo/workDetails", (req, res) => {
  const { workId } = req.query; // Extract activityId from query parameters
  
  const query = `
    SELECT 
        mw.id, 
        mw.work_id, 
        mw.workid, 
        mw.farmer_name, 
        mw.father_name, 
        mw.project, 
        mw.village_id,
        mw.district_id,
        mw.block_id,
        mw.panchayat_id,
        mpa.name AS project_name,
        ma.name AS activity_name, 
        mw.activity_type, 
        mw.activity, 
        mv.name AS village_name, 
        ms.name AS state_name, 
        md.name AS district_name, 
        mb.name AS block_name, 
        mp.name AS panchayat_name, 
        mw.name, 
        mw.cdate, 
        mw.cby, 
        mw.status 
    FROM 
        master_workid AS mw 
    LEFT JOIN 
        master_activity_type AS ma ON mw.activity_type = ma.atypeid 
    LEFT JOIN 
        master_village AS mv ON mw.village_id = mv.village_id 
    LEFT JOIN 
        master_state AS ms ON mw.sid = ms.sid 
    LEFT JOIN 
        master_district AS md ON mw.district_id = md.did 
    LEFT JOIN 
        master_block AS mb ON mw.block_id = mb.block_id 
    LEFT JOIN 
        master_panchayat AS mp ON mw.panchayat_id = mp.panchayat_id 
    JOIN 
        master_project_area AS mpa ON mw.project = mpa.project_id
    WHERE 
        mw.workid = ?; 
  `;
  
  connection.query(query, [workId], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(results);
  });
});



app.get("/geo/completeProjects",(req,res)=>{
  const empId = req.query.empId;



  const query = `
  SELECT 
      pd.emp_id, 
      pd.farmer_name,
      pd.entry_date,
      mpa.name AS project_name,
      ma.name AS activity_names, 
      mv.name AS village_name, 
      md.name AS district_name, 
      mb.name AS block_name, 
      mp.name AS panchayat_name,
      mat.name AS activity_type_name,
      emp.name AS employee_name,
      id.url AS image_url,
      id.lat AS image_lat,
      id.longitude AS image_longitude,
      id.description AS image_description,
      id.date_time AS image_date_time
  FROM project_detail AS pd 
  LEFT JOIN master_activity AS ma ON pd.activity_type = ma.atid 
  LEFT JOIN master_activity_type AS mat ON pd.activity_name = mat.atypeid
  LEFT JOIN master_village AS mv ON pd.village = mv.village_id 
  LEFT JOIN master_district AS md ON pd.dist = md.did 
  LEFT JOIN master_block AS mb ON pd.block = mb.block_id 
  LEFT JOIN master_panchayat AS mp ON pd.panchayat = mp.panchayat_id 
    LEFT JOIN employee AS emp ON pd.emp_id = emp.emp_id
  JOIN master_project_area AS mpa ON pd.project_area = mpa.project_id
 INNER JOIN image_detail AS id ON pd.pid = id.pid
    WHERE pd.emp_id = ?
     ORDER BY id.id DESC
`;

connection.query(query, [empId], (error, results) => {
  if (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  res.json(results);
});


})

app.post("/geo/updateStatus", (req, res) => {
  const projectId = req.query.projectAssignId; // Accessing query parameter

  const query = "UPDATE `project_assign` SET `status`='Active' WHERE project_assign_id= ?";

  connection.query(query, [projectId], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ message: "success" });
    console.log("updated status")
  });
});

app.get("/geo",(req,res)=>{
     res.send("hello")
})


app.listen(port, () => {
  console.log("server is running", {port});
});