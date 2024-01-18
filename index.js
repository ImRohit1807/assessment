const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'interviewAssessment'
})

db.connect((err) => {
    if (err) {
        console.log('Database connection failed: ' + err)
        return
    }
    console.log('Connected to database: ');
})
app.use(bodyParser.json())

function createTables() {
    const tableGenerate = `
    CREATE TABLE IF NOT EXISTS students(
        student_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        age INT,
        class_id INT,
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
    );

    CREATE TABLE IF NOT EXISTS teachers(
        teacher_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        subject VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes(
        class_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
    );

    CREATE TABLE IF NOT EXISTS parents(
        parent_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
    );

    CREATE TABLE IF NOT EXISTS assessments(
        assessment_id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        class_id INT,
        assessment TEXT,
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
    );

    CREATE TABLE IF NOT EXISTS parent_child_relationship(
        parent_id INT,
        child_id INT,
        PRIMARY KEY(parent_id, child_id),
        FOREIGN KEY (parent_id) REFERENCES parents(parent_id),
        FOREIGN KEY (child_id) REFERENCES students(student_id)
    );

    CREATE TABLE IF NOT EXISTS Meetings(
        meeting_id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        parent_id INT,
        child_id INT,
        meeting_date DATE
        isMeet BOOLEAN
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
        FOREIGN KEY (parent_id) REFERENCES parents(parent_id),
        FOREIGN KEY (child_id) REFERENCES students(student_id)
    );
    `
}
createTables()
db.query(createTables, (err) => {
    if (!err) {
        console.log("Table created")
    } else {
        console.error(err)
    }
    db.end();
});

// Assign assessment to students
app.post('assign/assessment', (req, res) => {
    console.log('Assigning assessment');
    const { teacherId, classId, assessment } = req.body
    const checkAssessment = `select * from assessment where classId = classId`
    const assessmentData = db.query(checkAssessment)
    if (assessmentData) {
        return res.json({ error: 'Assessment already assigned to this class' })
    }

    const sql = `insert into assessment (teacherId, classId,assessment),values (?,?,?)`;
    db.query(sql, [teacher_id, class_id, assessment], (err, res) => {
        if (err) {
            console.error(`Getting error while creating assessment ${err.message}`)
            return res.status(err.status).json({ error: err.message })
        }
    })
})

app.post('/scheduleMeeting', (req, res) => {
    console.log('Scheduling parent meeting');
    const { teacherId, ParentId, studentId, meetingDate } = req.body
    const sql = `insert into Meetings (teacherId, ParentId, studentId , meetingDate),values (?,?,?,?)`;
    db.query(sql, [teacherId, ParentId, studentId, meetingDate], (err, res) => {
        if (err) {
            console.error(`Getting error while Scheduling parent meeting ${err.message}`)
            return res.status(err.statusCode).json({ error: err.message })
        }
    })
    res.status(res.statusCode).json({ message: 'Parent Meeting scheduled' })
})

app.post('/meet', (req, res) => {
    const { teacherId, ParentId, studentId, meetingDate } = req.body
    const sql = `select * from meetings where child_id = studentId AND Parent_Id=ParentId`
    const resData = db.query(sql)
    if (resData.isMeet) {
        return res.send("Already met")
    }
})

app.post('/updateStatus', (req, res) => {
    const { teacherId, ParentId, studentId, meetingId, isMeet } = req.body
    const sql = `select * from meetings where child_id = studentId AND Parent_Id=ParentId`
    const resData = db.query(sql)
    if (resData) {
        const updateQuery = 'update SET isMeet = isMeet where child_id = studentId AND Parent_Id=ParentId'
        const resData = db.query(sql)
        if(resData) {
            return res.status(201).json({ message: "Updated Successfully" });
        }
    }
})


app.listen(3004, () => {
    console.log('server started on port 3004')
})