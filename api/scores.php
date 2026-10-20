<?php
// API du scoreboard du jeu « Cours, petit Claude ! »
// Les 3 meilleurs scores sont gardés dans data/scores.json
// GET  /api/scores.php                 -> top 3
// POST /api/scores.php {pseudo, score} -> enregistre le score puis renvoie le top 3

header('Content-Type: application/json; charset=utf-8');

const TOP_SIZE  = 3;
const COOLDOWN  = 10; // secondes entre deux envois d'un même visiteur

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0750, true);

// Verrou sur le fichier pour que deux envois simultanés ne s'écrasent pas
$file = fopen($dataDir . '/scores.json', 'c+');
flock($file, LOCK_EX);
$data = json_decode(stream_get_contents($file), true) ?: [];
$data += ['scores' => [], 'recent' => []];

function respond(int $code, $payload, $file): void {
  flock($file, LOCK_UN);
  fclose($file);
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') respond(200, $data['scores'], $file);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Méthode non autorisée'], $file);

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$pseudo = trim(preg_replace('/\s+/', ' ', (string) ($body['pseudo'] ?? '')));
$score  = filter_var($body['score'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100000]]);

if ($pseudo === '' || mb_strlen($pseudo) > 16) respond(400, ['error' => 'Pseudo invalide (1 à 16 caractères)'], $file);
if ($score === false) respond(400, ['error' => 'Score invalide'], $file);

// IP hachée, jamais stockée en clair ; on oublie les envois plus vieux que le délai
$now    = time();
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|scoreboard');
$data['recent'] = array_filter($data['recent'], fn($t) => $now - $t < COOLDOWN);
if (isset($data['recent'][$ipHash])) respond(429, ['error' => 'Doucement ! Réessaie dans quelques secondes.'], $file);
$data['recent'][$ipHash] = $now;

// Un seul score par pseudo (le meilleur), puis on garde le top 3
$scores = array_values(array_filter($data['scores'], fn($s) => mb_strtolower($s['pseudo']) !== mb_strtolower($pseudo) || $s['score'] >= $score));
if (!array_filter($scores, fn($s) => mb_strtolower($s['pseudo']) === mb_strtolower($pseudo))) {
  $scores[] = ['pseudo' => $pseudo, 'score' => $score];
}
usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);
$data['scores'] = array_slice($scores, 0, TOP_SIZE);

ftruncate($file, 0);
rewind($file);
fwrite($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
respond(200, $data['scores'], $file);
