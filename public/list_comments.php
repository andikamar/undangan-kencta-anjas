<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
date_default_timezone_set('Asia/Jakarta');


$host='localhost';
$db='iwhlvgxm_undanganapi';
$user='iwhlvgxm_undanganapi';
$pass='2L4bK*Y.!AW~_+Rv';

try{
$pdo=new PDO(
"mysql:host=$host;dbname=$db;charset=utf8mb4",
$user,
$pass,
[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]
);
}catch(PDOException $e){
echo json_encode(['status'=>false,'message'=>'DB error']);
exit;
}

$stmt=$pdo->query("
SELECT 
c.*,
COUNT(l.id) as likes
FROM comments c
LEFT JOIN likes l ON l.comment_id = c.uuid
GROUP BY c.uuid
ORDER BY c.created_at DESC
");
$comments=$stmt->fetchAll(PDO::FETCH_ASSOC);

$tree=[];
$refs=[];

foreach($comments as $c){

$c['comments']=[];
$c['likes'] = isset($c['likes']) ? (int)$c['likes'] : 0;
$c['replies']=[];
$c['updated_at']=$c['updated_at'] ?? $c['created_at'];

$refs[$c['uuid']]=$c;

}

foreach($refs as $uuid=>&$node){

if($node['parent_id'] && isset($refs[$node['parent_id']])){
$refs[$node['parent_id']]['comments'][]=&$node;
}else{
$tree[]=&$node;
}

}

echo json_encode([
'status'=>true,
'data'=>$tree
]);