import { RichText as RichTextLexical } from "@payloadcms/richtext-lexical/react";

import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/core/util";

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;

  return (
    <RichTextLexical
      className={cn(
        {
          container: enableGutter,
          "max-w-none": !enableGutter,
          "mx-auto prose md:prose-md dark:prose-invert": enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
}
