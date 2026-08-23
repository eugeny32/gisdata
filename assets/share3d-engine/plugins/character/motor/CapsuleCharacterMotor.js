import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const DOWN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1);
const EPSILON = 1e-5;
const DEFAULT_OPTIONS = {
    radius: 0.32,
    segmentLength: 1.08,
    eyeHeight: 1.55,
    groundControlMode: 'accelerated',
    groundContactGraceTime: 0,
    groundProbeRadiusScale: 0,
    groundProbeSamples: 0,
    moveSpeed: 4.8,
    runMultiplier: 1.55,
    jumpSpeed: 6.2,
    gravity: 20,
    groundAcceleration: 25,
    airAcceleration: 8,
    groundFriction: 10,
    groundStopSpeed: 0.05,
    maxStepHeight: 0.5,
    stepSearchSteps: 8,
    stepSearchIncrement: 0.08,
    stepSnapLockout: 0.08,
    groundSnapDistance: 0.18,
    groundFollowRise: 0.06,
    unsupportedGroundProtection: true,
    unsupportedGroundMaxDrop: 0.68,
    unsupportedGroundSearchSteps: 8,
    unsupportedGroundRefineIterations: 4,
    airSnapDistance: 0.06,
    airSnapMaxFallSpeed: 1.6,
    jumpSnapLockout: 0.14,
    maxSlopeAngleDeg: 50,
    collisionIterations: 2,
    depenetrationIterations: 2,
    maxSweepSteps: 8,
    maxSubsteps: 4,
    skinWidth: 0.02
};
class CapsuleCharacterMotor {
    constructor(queries, options = {}){
        this.queries = queries;
        this.capsuleStart = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1.2);
        this.velocity = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.grounded = false;
        this.groundNormal = null;
        this.stepHeight = 0;
        this.jumpSnapLockout = 0;
        this.groundSnapLockout = 0;
        this.groundContactGrace = 0;
        this.bodyYaw = 0;
        this.aimYaw = 0;
        this.aimPitch = 0;
        this.locomotionState = 'idle';
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };
    }
    get radius() {
        return this.options.radius;
    }
    setCapsuleStart(point) {
        this.capsuleStart.copy(point);
        this.velocity.set(0, 0, 0);
        this.stepHeight = 0;
        this.grounded = false;
        this.groundNormal = null;
        this.jumpSnapLockout = 0;
        this.groundSnapLockout = 0;
        this.groundContactGrace = 0;
        this.locomotionState = 'idle';
    }
    setFloorPoint(point) {
        this.capsuleStart.copy(this.resolveSpawnCapsuleStart(point));
        this.velocity.set(0, 0, 0);
        this.grounded = true;
        this.groundNormal = UP.clone();
        this.stepHeight = 0;
        this.jumpSnapLockout = 0;
        this.groundSnapLockout = 0;
        this.groundContactGrace = this.options.groundContactGraceTime;
        this.locomotionState = 'idle';
    }
    setOrientation(bodyYaw, aimYaw, aimPitch) {
        this.bodyYaw = bodyYaw;
        this.aimYaw = aimYaw;
        this.aimPitch = aimPitch;
    }
    getSnapshot() {
        const capsule = this.createCapsule();
        const planarSpeed = Math.hypot(this.velocity.x, this.velocity.y);
        return {
            capsule,
            floorPoint: capsule.start.clone().addScaledVector(UP, -capsule.radius),
            eyePosition: capsule.start.clone().addScaledVector(UP, this.options.eyeHeight - this.options.radius),
            velocity: this.velocity.clone(),
            grounded: this.grounded,
            groundNormal: this.groundNormal?.clone() ?? null,
            stepHeight: this.stepHeight,
            speed: this.velocity.length(),
            planarSpeed,
            bodyYaw: this.bodyYaw,
            aimYaw: this.aimYaw,
            aimPitch: this.aimPitch,
            locomotionState: this.locomotionState
        };
    }
    update(command, delta) {
        const clampedDelta = Math.min(delta, 0.05);
        const substeps = Math.max(1, Math.min(this.options.maxSubsteps, Math.ceil(clampedDelta / (1 / 60))));
        const stepDelta = clampedDelta / substeps;
        let jumpRequested = command.jump;
        let landed = false;
        this.setOrientation(command.bodyYaw, command.aimYaw, command.aimPitch);
        for(let index = 0; index < substeps; index += 1){
            landed = this.step(command, stepDelta, jumpRequested) || landed;
            jumpRequested = false;
        }
        this.locomotionState = this.resolveLocomotionState(command, landed);
        return this.getSnapshot();
    }
    step(command, delta, jumpRequested) {
        this.stepHeight = 0;
        const wasGrounded = this.grounded;
        const groundVelocitySolved = this.applyControlVelocity(command, delta, wasGrounded);
        if (jumpRequested && wasGrounded) {
            this.velocity.z = this.options.jumpSpeed;
            this.grounded = false;
            this.groundNormal = null;
            this.jumpSnapLockout = this.options.jumpSnapLockout;
            this.groundSnapLockout = 0;
            this.groundContactGrace = 0;
        }
        let damping = groundVelocitySolved ? 0 : Math.exp(-4 * delta) - 1;
        if (!this.grounded) {
            this.velocity.addScaledVector(DOWN, this.options.gravity * delta);
            damping *= 0.1;
        }
        this.velocity.addScaledVector(this.velocity, damping);
        if (wasGrounded) {
            const planarSpeedSq = this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y;
            if (planarSpeedSq <= this.options.groundStopSpeed ** 2) {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
        const startCapsule = this.createCapsule();
        const preCollisionVelocityZ = this.velocity.z;
        const motion = this.velocity.clone().multiplyScalar(delta);
        const planarMotion = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(motion.x, motion.y, 0);
        const movingPlanar = planarMotion.lengthSq() > EPSILON;
        const shouldProtectUnsupportedGround = this.shouldProtectUnsupportedGround(wasGrounded, jumpRequested, movingPlanar);
        let movement = this.moveAndCollide(startCapsule, motion, motion.z < 0 && !movingPlanar);
        let preservedGroundContact = false;
        let unsupportedGroundBlocked = false;
        if (wasGrounded && movingPlanar) {
            const currentProgress = getPlanarProgress(startCapsule, movement.capsule, planarMotion);
            const blockedNormal = movement.collisionNormal;
            const blockedByWall = !!movement.hit && currentProgress < 0.9 * planarMotion.length() && (!blockedNormal || blockedNormal.dot(UP) <= 0.6);
            if (blockedByWall) {
                const stepCandidate = this.tryStepAssist(startCapsule, planarMotion, currentProgress);
                if (stepCandidate && stepCandidate.planarProgress > currentProgress + EPSILON) {
                    movement = {
                        capsule: stepCandidate.capsule,
                        hit: movement.hit,
                        grounded: true,
                        groundNormal: stepCandidate.groundNormal?.clone() ?? UP.clone(),
                        collisionNormal: null,
                        appliedMotion: stepCandidate.capsule.start.clone().sub(startCapsule.start)
                    };
                    this.stepHeight = stepCandidate.stepHeight;
                    this.groundSnapLockout = Math.max(this.groundSnapLockout, this.options.stepSnapLockout);
                }
            }
        }
        if (!movement.grounded) {
            const groundAdjustment = this.followGround(movement.capsule, wasGrounded, movingPlanar, shouldProtectUnsupportedGround ? this.options.unsupportedGroundMaxDrop : null);
            if (groundAdjustment) movement = {
                capsule: groundAdjustment.capsule,
                hit: movement.hit,
                grounded: true,
                groundNormal: groundAdjustment.hit.normal?.clone() ?? UP.clone(),
                collisionNormal: movement.collisionNormal,
                appliedMotion: groundAdjustment.capsule.start.clone().sub(startCapsule.start)
            };
        }
        if (!movement.grounded && shouldProtectUnsupportedGround) {
            const protectedGround = this.resolveUnsupportedGroundProtection(startCapsule, movement.capsule, planarMotion);
            if (protectedGround) {
                unsupportedGroundBlocked = protectedGround.truncated;
                movement = {
                    capsule: protectedGround.capsule,
                    hit: movement.hit ?? protectedGround.hit,
                    grounded: true,
                    groundNormal: protectedGround.hit.normal?.clone() ?? UP.clone(),
                    collisionNormal: movement.collisionNormal,
                    appliedMotion: protectedGround.capsule.start.clone().sub(startCapsule.start)
                };
            }
        }
        if (!movement.grounded) {
            if (wasGrounded && movingPlanar && this.groundSnapLockout > 0 && this.velocity.z <= EPSILON) movement = {
                ...movement,
                grounded: true,
                groundNormal: this.groundNormal?.clone() ?? UP.clone()
            };
            else if (this.canPreserveGroundContact(wasGrounded)) {
                preservedGroundContact = true;
                movement = {
                    ...movement,
                    grounded: true,
                    groundNormal: this.groundNormal?.clone() ?? UP.clone()
                };
            }
        }
        const landed = !preservedGroundContact && !wasGrounded && movement.grounded && preCollisionVelocityZ < -EPSILON;
        this.applyCapsule(movement.capsule);
        this.grounded = movement.grounded;
        this.groundNormal = movement.groundNormal;
        if (movement.grounded) {
            this.groundContactGrace = preservedGroundContact ? Math.max(0, this.groundContactGrace - delta) : this.options.groundContactGraceTime;
            if (unsupportedGroundBlocked) this.clearUnsupportedGroundVelocity(planarMotion);
            if (this.velocity.z < 0) this.velocity.z = 0;
        } else {
            this.groundContactGrace = 0;
            if (movement.collisionNormal) {
                const into = this.velocity.dot(movement.collisionNormal);
                if (into < 0) this.velocity.addScaledVector(movement.collisionNormal, -into);
            }
        }
        this.jumpSnapLockout = Math.max(0, this.jumpSnapLockout - delta);
        this.groundSnapLockout = Math.max(0, this.groundSnapLockout - delta);
        return landed;
    }
    applyControlVelocity(command, delta, wasGrounded) {
        const wishDirection = getWishDirection(command.bodyYaw, command.move);
        if (wasGrounded && 'directional' === this.options.groundControlMode) {
            this.applyDirectionalGroundVelocity(wishDirection, command, delta);
            return true;
        }
        if (wishDirection.lengthSq() <= EPSILON) return false;
        const speedScale = command.run ? this.options.runMultiplier : 1;
        const acceleration = (wasGrounded ? this.options.groundAcceleration : this.options.airAcceleration) * speedScale;
        this.velocity.addScaledVector(wishDirection, acceleration * delta);
        const maxPlanarSpeed = this.options.moveSpeed * speedScale;
        const planarSpeed = Math.hypot(this.velocity.x, this.velocity.y);
        if (planarSpeed > maxPlanarSpeed && planarSpeed > EPSILON) {
            const scale = maxPlanarSpeed / planarSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
        return false;
    }
    applyDirectionalGroundVelocity(wishDirection, command, delta) {
        const currentPlanarVelocity = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(this.velocity.x, this.velocity.y, 0);
        const currentSpeed = currentPlanarVelocity.length();
        const hasMovement = wishDirection.lengthSq() > EPSILON;
        const speedScale = command.run ? this.options.runMultiplier : 1;
        const targetSpeed = hasMovement ? this.options.moveSpeed * speedScale : 0;
        const responseRate = targetSpeed > currentSpeed ? this.options.groundAcceleration : this.options.groundFriction;
        const alpha = 1 - Math.exp(-Math.max(responseRate, EPSILON) * delta);
        let nextSpeed = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(currentSpeed, targetSpeed, alpha);
        if (Math.abs(nextSpeed - targetSpeed) <= this.options.groundStopSpeed) nextSpeed = targetSpeed;
        if (nextSpeed <= this.options.groundStopSpeed && !hasMovement) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }
        const direction = hasMovement ? wishDirection : currentPlanarVelocity.lengthSq() > EPSILON ? currentPlanarVelocity.normalize() : null;
        if (!direction) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }
        this.velocity.x = direction.x * nextSpeed;
        this.velocity.y = direction.y * nextSpeed;
    }
    canPreserveGroundContact(wasGrounded) {
        return this.options.groundContactGraceTime > 0 && wasGrounded && this.groundContactGrace > 0 && this.jumpSnapLockout <= 0 && this.velocity.z <= EPSILON;
    }
    shouldProtectUnsupportedGround(wasGrounded, jumpRequested, movingPlanar) {
        return this.options.unsupportedGroundProtection && wasGrounded && !jumpRequested && movingPlanar && this.jumpSnapLockout <= 0;
    }
    resolveUnsupportedGroundProtection(startCapsule, targetCapsule, planarMotion) {
        const targetSupport = this.resolveGroundAdjustment(targetCapsule, this.options.groundFollowRise, Math.max(0, this.options.unsupportedGroundMaxDrop));
        if (targetSupport) return {
            ...targetSupport,
            truncated: false
        };
        const startSupport = this.resolveGroundAdjustment(startCapsule, this.options.groundFollowRise, 0);
        if (!startSupport) return null;
        let bestSupport = startSupport;
        let bestFraction = 0;
        let firstUnsupportedFraction = null;
        const searchSteps = Math.max(1, Math.floor(this.options.unsupportedGroundSearchSteps));
        for(let stepIndex = 1; stepIndex <= searchSteps; stepIndex += 1){
            const fraction = stepIndex / searchSteps;
            const support = this.resolveUnsupportedGroundAtFraction(startCapsule, planarMotion, fraction);
            if (!support) {
                firstUnsupportedFraction = fraction;
                break;
            }
            bestSupport = support;
            bestFraction = fraction;
        }
        if (null === firstUnsupportedFraction) return {
            ...bestSupport,
            truncated: bestFraction < 1 - EPSILON
        };
        const refineIterations = Math.max(0, Math.floor(this.options.unsupportedGroundRefineIterations));
        let unsupportedFraction = firstUnsupportedFraction;
        for(let iteration = 0; iteration < refineIterations; iteration += 1){
            const fraction = (bestFraction + unsupportedFraction) * 0.5;
            const support = this.resolveUnsupportedGroundAtFraction(startCapsule, planarMotion, fraction);
            if (support) {
                bestSupport = support;
                bestFraction = fraction;
            } else unsupportedFraction = fraction;
        }
        return {
            ...bestSupport,
            truncated: true
        };
    }
    resolveUnsupportedGroundAtFraction(startCapsule, planarMotion, fraction) {
        const candidate = cloneCapsule(startCapsule);
        translateCapsule(candidate, planarMotion.clone().multiplyScalar(fraction));
        return this.resolveGroundAdjustment(candidate, this.options.groundFollowRise, Math.max(0, this.options.unsupportedGroundMaxDrop));
    }
    clearUnsupportedGroundVelocity(planarMotion) {
        const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(planarMotion.x, planarMotion.y, 0);
        const distance = direction.length();
        if (distance <= EPSILON) return;
        direction.divideScalar(distance);
        const intoUnsupportedGround = this.velocity.x * direction.x + this.velocity.y * direction.y;
        if (intoUnsupportedGround <= EPSILON) return;
        this.velocity.x -= direction.x * intoUnsupportedGround;
        this.velocity.y -= direction.y * intoUnsupportedGround;
        if (Math.abs(this.velocity.x) <= EPSILON) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) <= EPSILON) this.velocity.y = 0;
    }
    moveAndCollide(startCapsule, motion, preserveWalkableVerticalStop = false) {
        if (motion.lengthSq() <= EPSILON) return {
            capsule: cloneCapsule(startCapsule),
            hit: null,
            grounded: false,
            groundNormal: null,
            collisionNormal: null,
            appliedMotion: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
        };
        if (!this.queries.resolveCapsule) return this.moveWithSlide(startCapsule, motion, preserveWalkableVerticalStop);
        const movedCapsule = cloneCapsule(startCapsule);
        translateCapsule(movedCapsule, motion);
        const hit = this.resolveCapsulePenetration(movedCapsule, this.options.collisionIterations + this.options.depenetrationIterations);
        const collisionNormal = hit ? normalizeCollisionNormal(hit) : null;
        const grounded = !!(hit && collisionNormal && this.isWalkable(hit));
        return {
            capsule: movedCapsule,
            hit,
            grounded,
            groundNormal: grounded ? collisionNormal.clone() : null,
            collisionNormal,
            appliedMotion: movedCapsule.start.clone().sub(startCapsule.start)
        };
    }
    tryStepAssist(capsule, motion, minimumProgress) {
        if (motion.lengthSq() <= EPSILON) return null;
        let bestCandidate = null;
        let bestProgress = minimumProgress;
        const probeHeights = this.buildStepAssistProbeHeights();
        for (const liftHeight of probeHeights){
            const candidate = this.tryStepAssistHeight(capsule, motion, liftHeight);
            if (!candidate) continue;
            if (candidate.planarProgress + EPSILON < bestProgress) continue;
            const shouldReplace = !bestCandidate || candidate.planarProgress > bestProgress + EPSILON || candidate.stepHeight < bestCandidate.stepHeight;
            if (!!shouldReplace) {
                bestCandidate = candidate;
                bestProgress = candidate.planarProgress;
                if (candidate.planarProgress >= 0.95 * motion.length()) break;
            }
        }
        return bestCandidate;
    }
    buildStepAssistProbeHeights() {
        const maxStepHeight = Math.max(this.options.maxStepHeight, this.options.skinWidth);
        const increment = Math.max(this.options.stepSearchIncrement, 2 * this.options.skinWidth);
        const denseCeiling = Math.min(maxStepHeight, Math.max(0.8, increment * this.options.stepSearchSteps));
        const heights = [];
        for(let liftHeight = increment; liftHeight < denseCeiling - EPSILON; liftHeight += increment)pushStepProbeHeight(heights, liftHeight);
        pushStepProbeHeight(heights, denseCeiling);
        if (maxStepHeight <= denseCeiling + EPSILON) return heights;
        const coarseSamples = Math.max(1, this.options.stepSearchSteps);
        for(let sampleIndex = 1; sampleIndex <= coarseSamples; sampleIndex += 1){
            const t = sampleIndex / coarseSamples;
            pushStepProbeHeight(heights, __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(denseCeiling, maxStepHeight, t));
        }
        return heights;
    }
    tryStepAssistHeight(capsule, motion, liftHeight) {
        const liftedCapsule = cloneCapsule(capsule);
        translateCapsule(liftedCapsule, UP.clone().multiplyScalar(liftHeight + this.options.skinWidth));
        const liftedHit = this.resolveCapsulePenetration(liftedCapsule, this.options.depenetrationIterations);
        if (liftedHit && Math.abs(liftedCapsule.start.z - capsule.start.z) <= EPSILON) return null;
        if (this.queries.overlapCapsule(liftedCapsule)) return null;
        const movement = this.moveAndCollide(liftedCapsule, motion);
        let steppedCapsule = movement.capsule;
        let groundNormal = movement.groundNormal;
        if (!movement.grounded) {
            const groundAdjustment = this.resolveGroundAdjustment(movement.capsule, this.options.skinWidth, liftHeight + this.options.groundSnapDistance);
            if (!groundAdjustment) return null;
            steppedCapsule = groundAdjustment.capsule;
            groundNormal = groundAdjustment.hit.normal?.clone() ?? UP.clone();
        }
        const steppedHeight = steppedCapsule.start.z - capsule.start.z;
        if (steppedHeight <= EPSILON || steppedHeight > this.options.maxStepHeight + this.options.skinWidth) return null;
        return {
            capsule: steppedCapsule,
            groundNormal,
            planarProgress: getPlanarProgress(capsule, steppedCapsule, motion),
            stepHeight: steppedHeight
        };
    }
    moveWithSlide(startCapsule, motion, preserveWalkableVerticalStop) {
        const nextCapsule = cloneCapsule(startCapsule);
        const initialStart = nextCapsule.start.clone();
        this.depenetrateCapsule(nextCapsule);
        const remaining = motion.clone();
        let lastHit = null;
        let collisionNormal = null;
        let grounded = false;
        let groundNormal = null;
        for(let iteration = 0; iteration < this.options.collisionIterations; iteration += 1){
            if (remaining.lengthSq() <= EPSILON) break;
            const hit = this.queries.sweepCapsule(nextCapsule, remaining, this.options.maxSweepSteps);
            if (!hit) {
                translateCapsule(nextCapsule, remaining);
                remaining.set(0, 0, 0);
                break;
            }
            lastHit = hit;
            collisionNormal = normalizeCollisionNormal(hit);
            const direction = remaining.clone().normalize();
            const rawTravelDistance = Math.max(hit.travelDistance ?? 0, 0);
            const safeTravelDistance = Math.max(rawTravelDistance - this.options.skinWidth, 0);
            if (safeTravelDistance > EPSILON) translateCapsule(nextCapsule, direction.clone().multiplyScalar(safeTravelDistance));
            const resolvedHit = this.resolveCapsulePenetration(nextCapsule, this.options.depenetrationIterations);
            if (resolvedHit) {
                lastHit = resolvedHit;
                collisionNormal = normalizeCollisionNormal(resolvedHit);
            }
            if (preserveWalkableVerticalStop && remaining.z < 0 && Math.abs(remaining.x) <= EPSILON && Math.abs(remaining.y) <= EPSILON && lastHit && this.isWalkable(lastHit)) {
                grounded = true;
                groundNormal = normalizeCollisionNormal(lastHit);
                remaining.set(0, 0, 0);
                break;
            }
            remaining.sub(direction.multiplyScalar(rawTravelDistance));
            if (!collisionNormal) {
                remaining.set(0, 0, 0);
                break;
            }
            if (lastHit && this.isWalkable(lastHit) && remaining.z <= EPSILON) {
                grounded = true;
                groundNormal = collisionNormal.clone();
            }
            const into = remaining.dot(collisionNormal);
            if (into < 0) remaining.addScaledVector(collisionNormal, -into);
        }
        return {
            capsule: nextCapsule,
            hit: lastHit,
            grounded,
            groundNormal,
            collisionNormal,
            appliedMotion: nextCapsule.start.clone().sub(initialStart)
        };
    }
    followGround(capsule, wasGrounded, movingPlanar, groundedMoveMaxDrop = null) {
        if (this.jumpSnapLockout > 0) return null;
        if (!wasGrounded) {
            if (this.velocity.z < -this.options.airSnapMaxFallSpeed) return null;
            return this.resolveGroundAdjustment(capsule, 0.02, this.options.airSnapDistance);
        }
        if (!movingPlanar) return this.resolveGroundAdjustment(capsule, this.options.groundFollowRise, 0);
        if (this.groundSnapLockout > 0) return this.resolveGroundAdjustment(capsule, this.options.groundFollowRise, 0);
        const maxDrop = groundedMoveMaxDrop ?? this.options.maxStepHeight + this.options.groundSnapDistance;
        return this.resolveGroundAdjustment(capsule, this.options.groundFollowRise, Math.max(0, maxDrop));
    }
    resolveGroundAdjustment(capsule, maxRise, maxDrop) {
        const groundProbe = this.resolveGroundProbe(capsule, maxRise, maxDrop);
        if (!groundProbe) return null;
        const adjustedCapsule = cloneCapsule(capsule);
        translateCapsule(adjustedCapsule, UP.clone().multiplyScalar(groundProbe.verticalOffset));
        this.depenetrateCapsule(adjustedCapsule);
        return {
            capsule: adjustedCapsule,
            hit: groundProbe.hit,
            verticalOffset: groundProbe.verticalOffset
        };
    }
    resolveGroundProbe(capsule, maxRise, maxDrop) {
        const centerProbe = this.resolveGroundProbeAtOffset(capsule, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), maxRise, maxDrop);
        if (centerProbe) return centerProbe;
        let bestProbe = null;
        for (const offset of this.createGroundProbeOffsets()){
            const probe = this.resolveGroundProbeAtOffset(capsule, offset, maxRise, maxDrop);
            if (!!probe) {
                if (!bestProbe || Math.abs(probe.verticalOffset) < Math.abs(bestProbe.verticalOffset)) bestProbe = probe;
            }
        }
        return bestProbe;
    }
    resolveGroundProbeAtOffset(capsule, offset, maxRise, maxDrop) {
        const probeOrigin = capsule.start.clone().add(offset).addScaledVector(UP, maxRise + this.options.radius);
        const hit = this.queries.resolveGround(probeOrigin, DOWN, maxRise + maxDrop + 2 * this.options.radius + this.options.skinWidth + EPSILON);
        if (!hit || !this.isWalkable(hit)) return null;
        const desiredStart = hit.point.clone().addScaledVector(UP, this.options.radius + this.options.skinWidth);
        const verticalOffset = desiredStart.sub(capsule.start).dot(UP);
        if (verticalOffset > maxRise + EPSILON || verticalOffset < -maxDrop - EPSILON) return null;
        return {
            hit,
            verticalOffset
        };
    }
    createGroundProbeOffsets() {
        const probeRadius = this.options.radius * __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.options.groundProbeRadiusScale, 0, 1);
        const sampleCount = Math.max(0, Math.floor(this.options.groundProbeSamples));
        if (probeRadius <= EPSILON || sampleCount <= 0) return [];
        const offsets = [];
        for(let index = 0; index < sampleCount; index += 1){
            const angle = index / sampleCount * Math.PI * 2;
            offsets.push(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(angle) * probeRadius, Math.sin(angle) * probeRadius, 0));
        }
        return offsets;
    }
    depenetrateCapsule(capsule) {
        this.resolveCapsulePenetration(capsule, this.options.depenetrationIterations);
    }
    resolveCapsulePenetration(capsule, maxIterations) {
        const resolved = this.queries.resolveCapsule?.(capsule, maxIterations, this.options.skinWidth);
        if (resolved) {
            capsule.start.copy(resolved.resolvedCapsule.start);
            capsule.end.copy(resolved.resolvedCapsule.end);
            return resolved;
        }
        let lastHit = null;
        for(let iteration = 0; iteration < maxIterations; iteration += 1){
            const hit = this.queries.overlapCapsule(capsule);
            if (!hit) break;
            lastHit = hit;
            const normal = normalizeCollisionNormal(hit);
            const penetrationDepth = Math.max(hit.penetrationDepth ?? 0, 0);
            if (!normal || penetrationDepth <= EPSILON) break;
            translateCapsule(capsule, normal.multiplyScalar(penetrationDepth + this.options.skinWidth));
        }
        return lastHit;
    }
    isWalkable(hit) {
        const normal = normalizeCollisionNormal(hit);
        if (!normal) return true;
        const maxSlopeCos = Math.cos(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(this.options.maxSlopeAngleDeg));
        return normal.dot(UP) >= maxSlopeCos;
    }
    applyCapsule(capsule) {
        this.capsuleStart.copy(capsule.start);
    }
    resolveSpawnCapsuleStart(point) {
        const capsule = {
            start: point.clone().addScaledVector(UP, this.options.radius + this.options.skinWidth),
            end: point.clone().addScaledVector(UP, this.options.radius + this.options.skinWidth + this.options.segmentLength),
            radius: this.options.radius
        };
        const liftStep = Math.max(2 * this.options.skinWidth, 0.5 * this.options.radius);
        const maxLift = Math.max(64, liftStep);
        const maxAttempts = Math.max(1, Math.ceil(maxLift / liftStep));
        for(let attempt = 0; attempt <= maxAttempts; attempt += 1){
            if (!this.queries.overlapCapsule(capsule)) break;
            translateCapsule(capsule, UP.clone().multiplyScalar(liftStep));
            this.resolveCapsulePenetration(capsule, this.options.depenetrationIterations);
        }
        return capsule.start.clone();
    }
    createCapsule() {
        return {
            start: this.capsuleStart.clone(),
            end: this.capsuleStart.clone().addScaledVector(UP, this.options.segmentLength),
            radius: this.options.radius
        };
    }
    resolveLocomotionState(command, landed) {
        if (landed) return 'land';
        if (!this.grounded) return this.velocity.z > EPSILON ? 'jump' : 'fall';
        const planarSpeed = Math.hypot(this.velocity.x, this.velocity.y);
        if (planarSpeed <= Math.max(this.options.groundStopSpeed, EPSILON)) return 'idle';
        return command.run ? 'run' : 'walk';
    }
}
function getWishDirection(bodyYaw, move) {
    const forward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(bodyYaw), Math.sin(bodyYaw), 0);
    const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(forward.y, -forward.x, 0);
    const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    if (move.forward > 0) direction.addScaledVector(forward, move.forward);
    if (move.forward < 0) direction.sub(forward.clone().multiplyScalar(-move.forward));
    if (move.right > 0) direction.addScaledVector(right, move.right);
    if (move.right < 0) direction.sub(right.clone().multiplyScalar(-move.right));
    if (direction.lengthSq() > EPSILON) direction.normalize();
    return direction;
}
function cloneCapsule(capsule) {
    return {
        start: capsule.start.clone(),
        end: capsule.end.clone(),
        radius: capsule.radius
    };
}
function translateCapsule(capsule, motion) {
    capsule.start.add(motion);
    capsule.end.add(motion);
}
function normalizeCollisionNormal(hit) {
    const source = hit.separationNormal ?? hit.normal;
    if (!source || source.lengthSq() <= EPSILON) return null;
    return source.clone().normalize();
}
function getPlanarProgress(from, to, desiredMotion) {
    const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(desiredMotion.x, desiredMotion.y, 0);
    const distance = direction.length();
    if (distance <= EPSILON) return 0;
    direction.divideScalar(distance);
    const delta = to.start.clone().sub(from.start);
    delta.z = 0;
    return Math.max(0, delta.dot(direction));
}
function pushStepProbeHeight(heights, value) {
    if (heights.length > 0 && Math.abs(heights[heights.length - 1] - value) <= EPSILON) return;
    heights.push(value);
}
export { CapsuleCharacterMotor };
