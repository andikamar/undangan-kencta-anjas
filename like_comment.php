<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
date_default_timezone_set('Asia/Jakarta');


$host='localhost';
$db='iwhlvgxm_undanganapi';
$user='iwhlvgxm_undanganapi';
$pass='2L4bK*Y.!AW~_+Rv';

try{
$pdo=new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4",$user,$pass,
[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
}catch(PDOException $e){
echo json_encode(['status'=>false]); exit;
}

$comment_id=$_POST['comment_id'] ?? null;
$ip=$_SERVER['REMOTE_ADDR'];

if(!$comment_id){
echo json_encode(['status'=>false]); exit;
}

$stmt=$pdo->prepare("SELECT * FROM likes WHERE comment_id=? AND ip=?");
$stmt->execute([$comment_id,$ip]);
$like=$stmt->fetch(PDO::FETCH_ASSOC);

if($like){

    $pdo->prepare("DELETE FROM likes WHERE id=?")->execute([$like['id']]);
    $action="unlike";

}else{

    $uuid=bin2hex(random_bytes(16));
    $pdo->prepare("INSERT INTO likes(uuid,comment_id,ip,created_at) VALUES(?,?,?,NOW())")
    ->execute([$uuid,$comment_id,$ip]);
    $action="like";

}

/* LETAKKAN DI SINI */
$count=$pdo->prepare("SELECT COUNT(*) FROM likes WHERE comment_id=?");
$count->execute([$comment_id]);
$total=$count->fetchColumn();

/* BARU RETURN JSON */
echo json_encode([
'status'=>true,
'action'=>$action,
'likes'=>$total
]);