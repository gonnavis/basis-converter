import { AlignParameter } from 'utils/typings'
export class ImageConvertFailed extends Error {
    name = 'ImageConvertFailed'
    constructor() {
        super('Unable to convert input image to PNG file')
    }
}

export interface ResizeParameter {
    resize: boolean | null;
    verticalAlign: AlignParameter | null;
    horizontalAlign: AlignParameter | null;
}

export const loadImage = async (url: string, resizeParams: ResizeParameter) => {
    const image = new Image();
    image.src = url;
    
    await new Promise<void>((resolve) => {
        image.onload = () => {
            resolve()
        }
    });

    const { resize, verticalAlign, horizontalAlign } = resizeParams;

    const canvasWidth = resize ? Math.pow(2, Math.ceil(Math.log2(image.width))) : image.width
    const canvasHeight = resize ? Math.pow(2, Math.ceil(Math.log2(image.height))): image.height

    let paintX = 0
    let paintY = 0

    switch (verticalAlign) {
        case AlignParameter.Start:
            paintY = 0;
            break;
        case AlignParameter.Center:
            paintY = (canvasHeight - image.height) / 2;
            break;
        case AlignParameter.End:
            paintY = canvasHeight - image.height;
            break;
    }

    switch (horizontalAlign) {
        case AlignParameter.Start:
            paintX = 0;
            break;
        case AlignParameter.Center:
            paintX = (canvasWidth - image.width) / 2;
            break;
        case AlignParameter.End:
            paintX = canvasWidth - image.width;
            break;
    }

    const canvas = document.createElement('CANVAS') as HTMLCanvasElement
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const context = canvas.getContext('2d')!
    context.drawImage(
        image, 
        paintX, 
        paintY
    )

    const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) throw new ImageConvertFailed()

                resolve(blob)
            }, 
        'image/png'
        )
    })

    return { imageBlob, width: canvasWidth, height: canvasHeight }
}