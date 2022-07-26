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
    getStudent: getStudent,
    calculateAverage: calculateAverage, 
    takeAttendance: takeAttendance
})

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) =>{
        console.log("Server runing at http://127.0.0.1:50051")
        server.start()
    }
)

function getStudent(call, callback){

    let student = studentsDataBase.find(person => person.name == call.request.name)
    let result = student ? student : "student not found"
    callback(null, result)
}

function calculateAverage(call){

    let students = studentsDataBase.filter((data) => {return data.room == call.request.room})
    
    for(let i = 0; i < students.length; i++){
        let subjects = subjectsDataBase.find(subject => subject.idStudent == students[i].id)
        
        let average = (subjects.biology + subjects.grammar + subjects.mathematics + subjects.story) / 4
        
        
        average > 5 ? 
        call.write({message: `${students[i].name} has been APPROVED with average: '${average}'`}) :
        call.write({message: `Unfortunately, ${students[i].name} has been FAILED with average '${average}'`})
    }

    call.end()
}

function takeAttendance(call, callback){
    let presentStudents = [];
    let absentStudents = studentsDataBase;

    call.on('data', (data)=>{
        indexStudent = absentStudents.findIndex((student) => student.name == data.name)
        if(indexStudent != -1){
            presentStudents.push(studentsDataBase.find(person => person.name == data.name))
            absentStudents.splice(indexStudent, 1)
        }
    })

    call.on('end', ()=>{
        callback(null, {
            studentsPresents: presentStudents,
            studentsAbsent: absentStudents,
        })
    })
}