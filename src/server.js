const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../proto/services.proto";
var protoLoader = require("@grpc/proto-loader")

const studentsDataBase = require('../database/students.json')
const subjectsDataBase = require('../database/subjects.json')

const options ={
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const studentsProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(studentsProto.StudentsManagement.service, {
    getStudentGrade,
    calculateAverage,
    takeAttendance,
    getHighestGrade
})

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) =>{
        console.log("Server runing at http://127.0.0.1:50051")
        server.start()
    }
)

//SERVICES

// Normal requisition
function getStudentGrade(call, callback){

    let student = studentsDataBase.find(person => person.name == call.request.name)

    console.log(`Search ${student.name} grade`)
    let result = student ? subjectsDataBase.find(subjescts => subjescts.idStudent == student.id) : "student not found"
    callback(null, result)
}

// Serverside streaming
function calculateAverage(call){
    console.log('Calculate average of all students')
    let students = studentsDataBase
    for(let i = 0; i < students.length; i++){
        let subjects = subjectsDataBase.find(subject => subject.idStudent == students[i].id)
        
        let average = (subjects.biology + subjects.grammar + subjects.mathematics + subjects.story) / 4
        
        average > 5 ? 
        call.write({message: `${students[i].name} has been APPROVED with average: '${average}'`}) :
        call.write({message: `Unfortunately, ${students[i].name} has been FAILED with average '${average}'`})
    }

    call.end()
}

// Clientside streaming
function takeAttendance(call, callback){
    let presentStudents = [];
    let absentStudents = studentsDataBase.map(x => x);

    call.on('data', (data)=>{
        indexStudent = absentStudents.findIndex((student) => student.name == data.name)
        if(indexStudent != -1){
            console.log(data.name+" is present")
            presentStudents.push(studentsDataBase.find(person => person.name == data.name))
            absentStudents.splice(indexStudent, 1)
        }else{
            console.log(data.name+" doesn't study here")
        }
    })
    
    call.on('end', ()=>{
        console.log("All of then is absent: ", absentStudents)
        callback(null, {
            studentsPresents: presentStudents,
            studentsAbsent: absentStudents,
        })
    })
}

// Dureplex staming
function getHighestGrade(call){
    var gradeData;

    function selectGrade(gradeName){
        return function(obj){
            const newObj = {};
            newObj["grade"] = obj[gradeName];
            newObj["idStudent"] = obj["idStudent"];
            return newObj;
        }
    }

    function highestGrade(list){
        let bigger = {grade: 0, idStudent: 0}

        for(var i = 0; i < list.length; i++){
            if(list[i].grade > bigger.grade){
                bigger = list[i]
            }
        }
        return bigger
    }

    call.on('data', async (data) =>{
        console.log("\n Calculating the highest grade of "+ (data.grade).toUpperCase() +"...")
        gradeData = data.grade
        let gradeList = subjectsDataBase.map(selectGrade(gradeData))
        let result = highestGrade(gradeList)
        
        let student = studentsDataBase.find(person => person.id == result.idStudent)

        call.write(student)
    })

    call.on('end', ()=>{
        console.log("Awaiting more request")
        call.end()
    })
}