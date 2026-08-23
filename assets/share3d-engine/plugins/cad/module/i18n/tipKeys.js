const CadTipKey = {
    draw: {
        firstPoint: 'draw.firstPoint',
        nextPoint: 'draw.nextPoint',
        angularDimension: {
            firstLine: 'draw.angularDimension.firstLine',
            secondLine: 'draw.angularDimension.secondLine',
            position: 'draw.angularDimension.position',
            parallelLinesRetry: 'draw.angularDimension.parallelLinesRetry'
        },
        arc: {
            startPoint: 'draw.arc.startPoint',
            midPoint: 'draw.arc.midPoint',
            endPoint: 'draw.arc.endPoint',
            radius: 'draw.arc.radius'
        },
        circle: {
            firstPoint: 'draw.circle.firstPoint',
            secondPoint: 'draw.circle.secondPoint',
            thirdPoint: 'draw.circle.thirdPoint',
            firstDiameterPoint: 'draw.circle.firstDiameterPoint',
            secondDiameterPoint: 'draw.circle.secondDiameterPoint',
            centerPoint: 'draw.circle.centerPoint',
            radius: 'draw.circle.radius'
        },
        rect: {
            firstCorner: 'draw.rect.firstCorner',
            otherCorner: 'draw.rect.otherCorner',
            firstBasePoint: 'draw.rect.firstBasePoint',
            secondBasePoint: 'draw.rect.secondBasePoint',
            height: 'draw.rect.height'
        },
        text: {
            bounds: 'draw.text.bounds'
        },
        dimension: {
            firstOrigin: 'draw.dimension.firstOrigin',
            secondOrigin: 'draw.dimension.secondOrigin',
            linePosition: 'draw.dimension.linePosition'
        },
        ellipse: {
            axisEnd: 'draw.ellipse.axisEnd',
            otherAxisEnd: 'draw.ellipse.otherAxisEnd',
            otherSemiAxisLength: 'draw.ellipse.otherSemiAxisLength'
        },
        hatch: {
            target: 'draw.hatch.target'
        },
        mLeader: {
            leaderPoint: 'draw.mLeader.leaderPoint',
            textPoint: 'draw.mLeader.textPoint'
        },
        polygon: {
            edgeCountLabel: 'draw.polygon.edgeCountLabel',
            center: 'draw.polygon.center',
            circumscribedRadius: 'draw.polygon.circumscribedRadius'
        },
        ray: {
            startPoint: 'draw.ray.startPoint',
            pointOnRay: 'draw.ray.pointOnRay'
        }
    },
    auxiliary: {
        polar: {
            status: 'auxiliary.polar.status'
        }
    },
    edit: {
        break: {
            target: 'edit.break.target',
            secondPoint: 'edit.break.secondPoint'
        },
        close: {
            target: 'edit.close.target',
            success: 'edit.close.success'
        },
        move: {
            pendingCount: 'edit.move.pendingCount',
            basePoint: 'edit.move.basePoint',
            targetPoint: 'edit.move.targetPoint'
        },
        copy: {
            pendingCount: 'edit.copy.pendingCount',
            basePoint: 'edit.copy.basePoint',
            targetPoint: 'edit.copy.targetPoint'
        },
        join: {
            pendingCount: 'edit.join.pendingCount',
            result: 'edit.join.result'
        },
        extend: {
            target: 'edit.extend.target'
        },
        offset: {
            distanceLabel: 'edit.offset.distanceLabel',
            target: 'edit.offset.target',
            direction: 'edit.offset.direction'
        },
        rotate: {
            pendingCount: 'edit.rotate.pendingCount',
            basePoint: 'edit.rotate.basePoint',
            angle: 'edit.rotate.angle'
        },
        trim: {
            target: 'edit.trim.target'
        }
    }
};
const defaultCadMessages = {
    [CadTipKey.draw.firstPoint]: '指定第一个点',
    [CadTipKey.draw.nextPoint]: '指定下一个点',
    [CadTipKey.draw.angularDimension.firstLine]: '选择夹角边: 1',
    [CadTipKey.draw.angularDimension.secondLine]: '选择夹角边: 2',
    [CadTipKey.draw.angularDimension.position]: '确认标注位置',
    [CadTipKey.draw.angularDimension.parallelLinesRetry]: '两边平行，重新选择第二条边',
    [CadTipKey.draw.arc.startPoint]: '指定圆弧的起点',
    [CadTipKey.draw.arc.midPoint]: '指定圆弧的第二点',
    [CadTipKey.draw.arc.endPoint]: '指定圆弧的端点',
    [CadTipKey.draw.arc.radius]: '指定圆弧的半径',
    [CadTipKey.draw.circle.firstPoint]: '指定圆上的第一点',
    [CadTipKey.draw.circle.secondPoint]: '指定圆上的第二点',
    [CadTipKey.draw.circle.thirdPoint]: '指定圆上的第三点',
    [CadTipKey.draw.circle.firstDiameterPoint]: '指定圆直径的第一个端点',
    [CadTipKey.draw.circle.secondDiameterPoint]: '指定圆直径的第二个端点',
    [CadTipKey.draw.circle.centerPoint]: '指定圆心',
    [CadTipKey.draw.circle.radius]: '指定半径',
    [CadTipKey.draw.rect.firstCorner]: '指定第一个角点',
    [CadTipKey.draw.rect.otherCorner]: '指定另一个角点',
    [CadTipKey.draw.rect.firstBasePoint]: '指定底边的第一个点',
    [CadTipKey.draw.rect.secondBasePoint]: '指定底边的第二个点',
    [CadTipKey.draw.rect.height]: '指定高度',
    [CadTipKey.draw.text.bounds]: '确认标注宽度',
    [CadTipKey.draw.dimension.firstOrigin]: '指定第一个尺寸界线原点',
    [CadTipKey.draw.dimension.secondOrigin]: '指定第二个尺寸界线原点',
    [CadTipKey.draw.dimension.linePosition]: '指定尺寸界线位置',
    [CadTipKey.draw.ellipse.axisEnd]: '确认一轴端点',
    [CadTipKey.draw.ellipse.otherAxisEnd]: '确认轴的另一端点',
    [CadTipKey.draw.ellipse.otherSemiAxisLength]: '确认另一条半轴长度',
    [CadTipKey.draw.hatch.target]: '确认填充的对象',
    [CadTipKey.draw.mLeader.leaderPoint]: '确认引注点',
    [CadTipKey.draw.mLeader.textPoint]: '确认标注点位',
    [CadTipKey.draw.polygon.edgeCountLabel]: '输入边数: ',
    [CadTipKey.draw.polygon.center]: '确认多边形中心',
    [CadTipKey.draw.polygon.circumscribedRadius]: '确认外切圆半径',
    [CadTipKey.draw.ray.startPoint]: '确认射线起点',
    [CadTipKey.draw.ray.pointOnRay]: '确认射线上某点',
    [CadTipKey.auxiliary.polar.status]: '极轴: {distance} < {angle}°',
    [CadTipKey.edit.break.target]: '选择对象',
    [CadTipKey.edit.break.secondPoint]: '选择第二个打断点',
    [CadTipKey.edit.close.target]: '选择待闭合多段线',
    [CadTipKey.edit.close.success]: '闭合成功',
    [CadTipKey.edit.move.pendingCount]: '待移动对象：{count}',
    [CadTipKey.edit.move.basePoint]: '选择移动基准点',
    [CadTipKey.edit.move.targetPoint]: '选择粘贴基点',
    [CadTipKey.edit.copy.pendingCount]: '待复制对象：{count}',
    [CadTipKey.edit.copy.basePoint]: '选择复制基准点',
    [CadTipKey.edit.copy.targetPoint]: '选择粘贴基点',
    [CadTipKey.edit.join.pendingCount]: '待合并对象：{count}',
    [CadTipKey.edit.join.result]: '{joined}个对象合并成功，{skipped}个对象放弃',
    [CadTipKey.edit.extend.target]: '选择延伸对象',
    [CadTipKey.edit.offset.distanceLabel]: '输入偏移距离: ',
    [CadTipKey.edit.offset.target]: '选择偏移对象',
    [CadTipKey.edit.offset.direction]: '确认偏移方向',
    [CadTipKey.edit.rotate.pendingCount]: '待旋转对象：{count}',
    [CadTipKey.edit.rotate.basePoint]: '选择旋转基准点',
    [CadTipKey.edit.rotate.angle]: '确认旋转角度',
    [CadTipKey.edit.trim.target]: '选择修剪对象'
};
export { CadTipKey, defaultCadMessages };
