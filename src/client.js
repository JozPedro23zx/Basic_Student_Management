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
async function main(){

    studentData();
    await sleep(3000);

    averageList();
    await sleep(4000);

    attendanceStudents();
    await sleep(4000);

    bestGrade();
}

function studentData(){
    client.getStudent({name: "Fernando"}, function(err, response){
        if(err) console.log(err)
        response.id == 0 ? console.log("Student not found") : console.log(response)
        console.log("\n =========================================== \n")
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
        console.log("\n =========================================== \n")
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

async function bestGrade(){
    let dublexCall = client.getBestGrade()

    dublexCall.on('data', response =>{
        console.log(response)
    })

    dublexCall.write({grade: 'grammar'})
    await sleep(4000)
    dublexCall.write({grade: 'mathematics'})
    await sleep(4000)
    dublexCall.write({grade: 'story'})
    await sleep(4000)
    dublexCall.write({grade: 'biology'})

    dublexCall.end()
}

main()

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }