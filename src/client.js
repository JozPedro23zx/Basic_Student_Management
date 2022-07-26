const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../proto/services.proto";
var protoLoader = require("@grpc/proto-loader");

const options ={
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const StudentsManagement = grpc.loadPackageDefinition(packageDefinition).StudentsManagement;

const client = new StudentsManagement(
    "localhost:50051",
    grpc.credentials.createInsecure()
);


//CALL SERVICES
function main(){

    studentData();
    console.log("\n ===========================================")
    averageList();
    console.log("\n ===========================================")
    attendanceStudents();
}

function studentData(){
    client.getStudent({name: "Fernando"}, function(err, response){
        if(err) console.log(err)
        response.id == 0 ? console.log("Student not found") : console.log(response)
    })
}

function averageList(){
    let call = client.calculateAverage({room: "A"});

    call.on('data', (response)=>{
        console.log(response.message)
        console.log("================")
    })

    call.on('end', ()=>{
        console.log("This is students average")
    })
}

function attendanceStudents(){
    let studentsList = [{
        name: "Fernando",
        room: "A"
    },{
        name: "Bruno",
        room: "A"
    },{
        name: "Ana",
        room: "A"
    },
    {
        name: "Kakaroto",
        room: "A"
    }]

    let call = client.takeAttendance((err, response)=>{
        if(err) console.log(err)
        console.log(response)
    });

    studentsList.map((student)=>{
        call.write(student)
    })

    call.end()
}

main()