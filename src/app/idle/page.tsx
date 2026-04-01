"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../store/useAppStore";
import MainLayout from "../components/MainLayout";

const SPRITE_BASE = "/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets/Characters";

const SPRITES = {
  humanIdle: `${SPRITE_BASE}/Human/IDLE/base_idle_strip9.png`,
  humanAttack: `${SPRITE_BASE}/Human/ATTACK/base_attack_strip10.png`,
  skeletonIdle: `${SPRITE_BASE}/Skeleton/PNG/skeleton_idle_strip6.png`,
  skeletonHurt: `${SPRITE_BASE}/Skeleton/PNG/skeleton_hurt_strip7.png`,
  skeletonDeath: `${SPRITE_BASE}/Skeleton/PNG/skeleton_death_strip10.png`,
};

// Sprite strip config: [frameCount, frameWidth, frameHeight]
const SPRITE_CONFIG: Record<string, [number, number, number]> = {
  humanIdle: [9, 48, 48],
  humanAttack: [10, 48, 48],
  skeletonIdle: [6, 48, 48],
  skeletonHurt: [7, 48, 48],
  skeletonDeath: [10, 48, 48],
};

function SpriteAnimation({
  spriteKey,
  scale = 4,
  fps = 8,
  onAnimationEnd,
  loop = true,
  flipX = false,
}: {
  spriteKey: keyof typeof SPRITES;
  scale?: number;
  fps?: number;
  onAnimationEnd?: () => void;
  loop?: boolean;
  flipX?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const [frameCount, frameWidth, frameHeight] = SPRITE_CONFIG[spriteKey];

  useEffect(() => {
    frameRef.current = 0;
    setFrame(0);

    const interval = setInterval(() => {
      frameRef.current += 1;
      if (frameRef.current >= frameCount) {
        if (loop) {
          frameRef.current = 0;
        } else {
          clearInterval(interval);
          onAnimationEnd?.();
          return;
        }
      }
      setFrame(frameRef.current);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [spriteKey, frameCount, fps, loop, onAnimationEnd]);

  const displayWidth = frameWidth * scale;
  const displayHeight = frameHeight * scale;

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url(${SPRITES[spriteKey]})`,
        backgroundPosition: `-${frame * displayWidth}px 0`,
        backgroundSize: `${frameCount * displayWidth}px ${displayHeight}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        transform: flipX ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

export default function IdlePage() {
  const router = useRouter();
  const {
    currentUser,
    currentUserID,
    isLoading,
    idleState,
    idleUpgrades,
    fetchUser,
    fetchIdleState,
    fetchIdleUpgrades,
    fetchUserUpgrades,
    initIdleState,
    dealDamageToEnemy,
    purchaseUpgrade,
    claimOfflineProgress,
    getUpgradeCost,
    getUpgradeLevel,
    getDamagePerHit,
    getAttackSpeed,
    getCriticalChance,
  } = useAppStore();

  const [playerAnim, setPlayerAnim] = useState<"humanIdle" | "humanAttack">("humanIdle");
  const [enemyAnim, setEnemyAnim] = useState<"skeletonIdle" | "skeletonHurt" | "skeletonDeath">("skeletonIdle");
  const [damagePopups, setDamagePopups] = useState<{ id: number; value: number; crit: boolean }[]>([]);
  const [offlineReport, setOfflineReport] = useState<{ goldEarned: number; enemiesDefeated: number } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const popupCounter = useRef(0);
  const attackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check
  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !currentUserID) {
      router.push("/login");
    }
  }, [isLoading, currentUserID, router]);

  // Initialize idle game data
  useEffect(() => {
    if (!currentUserID || isInitialized) return;

    const loadIdleData = async () => {
      await fetchIdleUpgrades();
      await initIdleState();
      await fetchIdleState();
      await fetchUserUpgrades();

      // Claim offline progress
      const report = await claimOfflineProgress();
      if (report && (report.goldEarned > 0 || report.enemiesDefeated > 0)) {
        setOfflineReport(report);
      }

      setIsInitialized(true);
    };

    loadIdleData();
  }, [currentUserID, isInitialized, fetchIdleUpgrades, initIdleState, fetchIdleState, fetchUserUpgrades, claimOfflineProgress]);

  // Auto-attack loop
  const doAttack = useCallback(() => {
    if (!idleState) return;

    const damage = getDamagePerHit();
    const critChance = getCriticalChance();
    const isCrit = Math.random() * 100 < critChance;
    const finalDamage = isCrit ? damage * 2 : damage;

    // Player attack animation
    setPlayerAnim("humanAttack");
    setTimeout(() => setPlayerAnim("humanIdle"), 400);

    // Enemy hurt
    if (idleState.enemy_hp - finalDamage <= 0) {
      setEnemyAnim("skeletonDeath");
      setTimeout(() => {
        setEnemyAnim("skeletonIdle");
      }, 1000);
    } else {
      setEnemyAnim("skeletonHurt");
      setTimeout(() => setEnemyAnim("skeletonIdle"), 300);
    }

    // Damage popup
    popupCounter.current += 1;
    const popupId = popupCounter.current;
    setDamagePopups((prev) => [...prev, { id: popupId, value: Math.floor(finalDamage), crit: isCrit }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1000);

    dealDamageToEnemy(finalDamage);
  }, [idleState, getDamagePerHit, getCriticalChance, dealDamageToEnemy]);

  useEffect(() => {
    if (!isInitialized || !idleState) return;

    const speed = getAttackSpeed();
    attackTimerRef.current = setInterval(doAttack, speed * 1000);

    return () => {
      if (attackTimerRef.current) clearInterval(attackTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, idleState?.enemy_level, getAttackSpeed, doAttack]);

  if (isLoading || !currentUser || !currentUserID) {
    return (
      <div className="flex flex-col justify-center items-center gap-8 hero bg-base-200 h-[100vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const hpPercent = idleState ? Math.max(0, (idleState.enemy_hp / idleState.enemy_max_hp) * 100) : 100;

  return (
    <MainLayout>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <main className="flex-grow flex flex-col">
          <div className="flex flex-col items-center gap-4 sm:gap-6 px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mx-auto w-full">
            <h2 className="text-xl sm:text-2xl font-bold">Idle Battle</h2>

            {/* Offline Progress Report */}
            {offlineReport && (
              <div className="alert alert-success shadow-lg w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Welcome back!</h3>
                  <div className="text-sm">
                    While you were away: defeated {offlineReport.enemiesDefeated} enemies and earned 🪙 {offlineReport.goldEarned} gold!
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => setOfflineReport(null)}>✕</button>
              </div>
            )}

            {/* Battle Arena */}
            <div className="card bg-base-100 shadow-lg w-full">
              <div className="card-body p-4 sm:p-6">
                {/* Enemy Info */}
                {idleState && (
                  <div className="text-center mb-2">
                    <span className="badge badge-error badge-lg gap-1">
                      💀 Skeleton Lv.{idleState.enemy_level}
                    </span>
                    <div className="w-full max-w-xs mx-auto mt-2">
                      <progress
                        className="progress progress-error w-full h-4"
                        value={hpPercent}
                        max="100"
                      />
                      <p className="text-xs text-base-content/60 mt-1">
                        {Math.ceil(idleState.enemy_hp)} / {idleState.enemy_max_hp} HP
                      </p>
                    </div>
                  </div>
                )}

                {/* Battle Scene */}
                <div className="flex items-end justify-center gap-8 sm:gap-16 py-4 relative min-h-[220px]">
                  {/* Player Character */}
                  <div className="flex flex-col items-center gap-2">
                    <SpriteAnimation spriteKey={playerAnim} scale={4} fps={playerAnim === "humanAttack" ? 12 : 8} loop={playerAnim === "humanIdle"} onAnimationEnd={() => setPlayerAnim("humanIdle")} />
                    <span className="badge badge-primary badge-sm">You</span>
                  </div>

                  {/* VS */}
                  <div className="text-2xl font-bold text-base-content/30 self-center">⚔️</div>

                  {/* Enemy */}
                  <div className="flex flex-col items-center gap-2 relative">
                    {/* Damage popups */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
                      {damagePopups.map((popup) => (
                        <span
                          key={popup.id}
                          className={`absolute whitespace-nowrap font-bold text-lg animate-damage-popup ${popup.crit ? "text-warning" : "text-error"}`}
                          style={{ left: `${Math.random() * 40 - 20}px` }}
                        >
                          {popup.crit && "💥 "}-{popup.value}
                        </span>
                      ))}
                    </div>
                    <SpriteAnimation spriteKey={enemyAnim} scale={4} fps={enemyAnim === "skeletonDeath" ? 10 : 8} loop={enemyAnim === "skeletonIdle"} flipX />
                    <span className="badge badge-error badge-sm">Enemy</span>
                  </div>
                </div>

                {/* Battle Stats */}
                <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-200 w-full">
                  <div className="stat place-items-center py-2">
                    <div className="stat-title text-xs">DPS</div>
                    <div className="stat-value text-lg text-primary">{(getDamagePerHit() / getAttackSpeed()).toFixed(1)}</div>
                  </div>
                  <div className="stat place-items-center py-2">
                    <div className="stat-title text-xs">Damage</div>
                    <div className="stat-value text-lg text-error">{getDamagePerHit()}</div>
                  </div>
                  <div className="stat place-items-center py-2">
                    <div className="stat-title text-xs">Speed</div>
                    <div className="stat-value text-lg text-info">{getAttackSpeed().toFixed(1)}s</div>
                  </div>
                  <div className="stat place-items-center py-2">
                    <div className="stat-title text-xs">Crit%</div>
                    <div className="stat-value text-lg text-warning">{getCriticalChance()}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            {idleState && (
              <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-100">
                <div className="stat place-items-center">
                  <div className="stat-title text-xs">Enemies Defeated</div>
                  <div className="stat-value text-xl">{idleState.enemies_defeated}</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title text-xs">Gold Earned</div>
                  <div className="stat-value text-xl text-warning">🪙 {Math.floor(idleState.total_gold_earned)}</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title text-xs">Current Gold</div>
                  <div className="stat-value text-xl text-warning">🪙 {currentUser.Gold}</div>
                </div>
              </div>
            )}

            {/* Upgrades */}
            <div className="card bg-base-100 shadow-lg w-full">
              <div className="card-body p-4 sm:p-6">
                <h3 className="card-title text-lg">Upgrades</h3>
                <p className="text-xs text-base-content/60 mb-2">Spend gold to power up. Your habit stats (Strength, Agility, Intelligence) also boost combat!</p>

                <div className="grid gap-3">
                  {idleUpgrades.map((upgrade) => {
                    const level = getUpgradeLevel(upgrade.id);
                    const cost = getUpgradeCost(upgrade.id);
                    const canAfford = currentUser.Gold >= cost;
                    const maxed = upgrade.max_level !== null && level >= upgrade.max_level;

                    return (
                      <div key={upgrade.id} className="flex items-center justify-between bg-base-200 rounded-lg p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{upgrade.name}</span>
                            <span className="badge badge-sm badge-primary">Lv.{level}</span>
                          </div>
                          <p className="text-xs text-base-content/60">{upgrade.description}</p>
                        </div>
                        <button
                          className={`btn btn-sm ${maxed ? "btn-disabled" : canAfford ? "btn-warning" : "btn-ghost btn-disabled"}`}
                          onClick={() => purchaseUpgrade(upgrade.id)}
                          disabled={maxed || !canAfford}
                        >
                          {maxed ? "MAX" : `🪙 ${cost}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Stat bonuses reminder */}
                <div className="divider text-xs">Habit Stat Bonuses</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-base-200 rounded p-2">
                    <div className="text-red-400 font-bold">💪 STR {currentUser.Strength}</div>
                    <div className="text-base-content/60">+{currentUser.Strength * 2} dmg</div>
                  </div>
                  <div className="bg-base-200 rounded p-2">
                    <div className="text-yellow-400 font-bold">⚡ AGI {currentUser.Agility}</div>
                    <div className="text-base-content/60">-{(currentUser.Agility * 0.05).toFixed(2)}s spd</div>
                  </div>
                  <div className="bg-base-200 rounded p-2">
                    <div className="text-pink-400 font-bold">🧠 INT {currentUser.Inteligent}</div>
                    <div className="text-base-content/60">+{currentUser.Inteligent}% crit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
