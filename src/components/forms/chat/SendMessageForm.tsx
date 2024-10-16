'use client';

import { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  CircleXIcon,
  DiscIcon,
  FilePlusIcon,
  ImagePlusIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
  VideoIcon,
} from 'lucide-react';

import { authSlice, chatActions, chatSlice, useAppDispatch, useAppSelector } from '@/redux';
import { sendMessage } from '@/socket';
import { Message } from '@/types';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  text: z.string().optional(),
  image: z.any().optional(),
  video: z.any().optional(),
  doc: z.any().optional(),
});

type Props = {
  conversationId: string;
  receiverId: string;
  setMessages: Dispatch<SetStateAction<Message[] | null>>;
};

const SendMessageForm: React.FC<Props> = ({ conversationId, receiverId, setMessages }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordedTime, setRecordedTime] = useState<number>(0);
  const [loadingBlob, setLoadingBlob] = useState<boolean>(false);
  const [isMediaUploading, setIsMediaUploading] = useState<boolean>(false);
  const [showUploadIcons, setShowUploadIcons] = useState<boolean>(false);

  const { startRecording, stopRecording, recordingBlob, isRecording, recordingTime } =
    useAudioRecorder();

  useEffect(() => {
    if (recordingBlob) {
      setRecordedAudio(recordingBlob);
      setLoadingBlob(false);
    }
  }, [recordingBlob]);

  const onStopRecording = () => {
    setRecordedTime(recordingTime);
    stopRecording();
    setLoadingBlob(true);
  };

  const onCancelRecording = () => {
    setRecordedTime(0);
    setRecordedAudio(null);
  };

  const sendAudio = async () => {
    if (recordedAudio) {
      setIsMediaUploading(true);
      const filename = new Date().toISOString();
      const file = new File([recordedAudio], `${filename}.webm`, { type: recordedAudio.type });
      setRecordedTime(0);
      setRecordedAudio(null);
      if (user) {
        await dispatch(
          chatActions.createMessage({
            conversationId,
            senderId: user._id,
            receiverId: receiverId,
            media: file,
          })
        );
      }
      setIsMediaUploading(false);
    }
  };

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      image: '',
      video: '',
      doc: '',
    },
  });

  const isError = (inputName: keyof formSchema): boolean => {
    const fieldState = form.getFieldState(inputName);
    return !!fieldState.error;
  };

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>, inputName: keyof formSchema) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      let isValid = false;
      let errorMessage = '';
      switch (inputName) {
        case 'image':
          if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            isValid = true;
          } else {
            errorMessage = '.jpg, .jpeg, and .png files are accepted';
          }
          break;
        case 'video':
          if (['video/mp4', 'video/avi', 'video/mov', 'video/mpeg'].includes(file.type)) {
            isValid = true;
          } else {
            errorMessage = '.mp4, .avi, .mov, and .mpeg files are accepted';
          }
          break;
        case 'doc':
          if (file.type === 'application/pdf') {
            isValid = true;
          } else {
            errorMessage = 'only PDF files are accepted';
          }
          break;
        default:
          break;
      }
      if (isValid) {
        form.setValue(inputName, file);
        form.clearErrors(inputName);
        setSelectedMedia(file.name.slice(0, 8));
        setShowUploadIcons(false);
      } else {
        form.setValue(inputName, '');
        form.setError(inputName, { message: errorMessage });
        setSelectedMedia(errorMessage);
      }
    } else {
      form.setValue(inputName, '');
      form.clearErrors(inputName);
    }
  };

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    const hasMedia = data.image !== '' || data.video !== '' || data.doc !== '';
    if (data.text === '' && !hasMedia) {
      form.setError('text', { message: 'message is required' });
      return;
    }
    setShowUploadIcons(false);
    setSelectedMedia(null);
    if (data.text && data.text !== '') {
      if (user) {
        setMessages(prev => {
          const newMessages = [
            ...(prev || []),
            {
              _id: user._id + receiverId,
              conversationId,
              senderId: user._id,
              text: data.text,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          dispatch(chatSlice.setMessages({ messages: newMessages }));
          return newMessages;
        });
        sendMessage({
          senderId: user._id,
          receiverId,
          text: data.text,
          seen: false,
        });
      }
    } else {
      setIsMediaUploading(true);
    }
    let media = null;
    if (data.image && data.image !== '') {
      media = data.image;
    } else if (data.video && data.video !== '') {
      media = data.video;
    } else if (data.doc && data.doc !== '') {
      media = data.doc;
    }
    form.reset();
    if (user) {
      await dispatch(
        chatActions.createMessage({
          conversationId,
          senderId: user._id,
          receiverId,
          text: data.text,
          media,
        })
      );
    }
    setIsMediaUploading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 w-full">
        <div className="w-full flex justify-around items-center p-2 rounded-[164px] border border-[#E5E6E9] h-[64px]">
          <Popover open={showUploadIcons} onOpenChange={setShowUploadIcons}>
            <PopoverTrigger className="disabled:cursor-not-allowed" disabled={isMediaUploading}>
              <div
                className={`w-10 h-10 rounded-full bg-primary flex justify-center items-center ${
                  isMediaUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}>
                <PlusIcon className="text-white w-[20px] h-[20px]" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-16">
              <div className="flex flex-col justify-center items-center gap-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem className="space-y-0">
                      <FormLabel
                        className={`w-10 h-10 cursor-pointer rounded-full flex justify-center items-center ${
                          isError('image')
                            ? 'bg-red-100/80 border border-red-300'
                            : 'bg-slate-100/50'
                        }`}>
                        <ImagePlusIcon className="text-primary w-6 h-6" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="sr-only"
                          onChange={e => handleMediaChange(e, 'image')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="video"
                  render={() => (
                    <FormItem className="space-y-0">
                      <FormLabel
                        className={`w-10 h-10 cursor-pointer rounded-full flex justify-center items-center ${
                          isError('video')
                            ? 'bg-red-100/80 border border-red-300'
                            : 'bg-slate-100/50'
                        }`}>
                        <VideoIcon className="text-primary w-6 h-6" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".mp4,.avi,.mov,.mpeg"
                          className="sr-only"
                          onChange={e => handleMediaChange(e, 'video')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doc"
                  render={() => (
                    <FormItem className="space-y-0">
                      <FormLabel
                        className={`w-10 h-10 cursor-pointer rounded-full flex justify-center items-center ${
                          isError('doc') ? 'bg-red-100/80 border border-red-300' : 'bg-slate-100/50'
                        }`}>
                        <FilePlusIcon className="text-primary w-6 h-6" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={e => handleMediaChange(e, 'doc')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </PopoverContent>
          </Popover>
          {selectedMedia ? (
            <div className="text-left w-[60%]">
              <div className="relative w-fit">
                <CircleXIcon
                  onClick={() => {
                    setSelectedMedia(null);
                    form.reset();
                  }}
                  className="bg-white text-red-600 w-4 h-4 cursor-pointer absolute -top-[5px] -right-[5px]"
                />
                <Badge variant="outline" className="text-[14px] leading-5 font-medium">
                  {selectedMedia}
                </Badge>
              </div>
            </div>
          ) : isRecording || loadingBlob || recordedAudio ? (
            <div className="relative text-right w-[60%]">
              {loadingBlob ||
                (recordedAudio && (
                  <CircleXIcon
                    onClick={onCancelRecording}
                    className="bg-white text-red-600 w-4 h-4 cursor-pointer absolute -top-[5px] -right-[5px]"
                  />
                ))}
              <Badge
                variant="outline"
                className="text-[14px] leading-5 font-medium">{`${isRecording ? recordingTime : recordedTime}s`}</Badge>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('text')}
                      disabled={isMediaUploading}
                      placeholder="Type Message"
                      className="text-[14px] text-black placeholder:text-[14px] placeholder:text-black border-none outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {isRecording ? (
            <Button
              type="button"
              onClick={onStopRecording}
              className="!p-0 w-10 h-10 rounded-full flex justify-center items-center animate-pulse">
              <DiscIcon className="text-white w-6 h-6" />
            </Button>
          ) : loadingBlob || recordedAudio ? (
            <Button
              type="button"
              onClick={sendAudio}
              className="!p-0 w-10 h-10 rounded-full flex justify-center items-center">
              <SendIcon className="text-white w-4 h-4" />
            </Button>
          ) : selectedMedia ? (
            <Button
              type="submit"
              className="!p-0 w-10 h-10 rounded-full flex justify-center items-center">
              <SendIcon className="text-white w-4 h-4" />
            </Button>
          ) : isMediaUploading ? (
            <Button
              type="button"
              disabled={true}
              className="!p-0 w-10 h-10 rounded-full flex justify-center items-center">
              <Spinner
                show={true}
                size="small"
                className="!text-white w-6 h-6"
                iconClassName="w-5 h-5 stroke-2"
              />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={startRecording}
              className="!p-0 w-10 h-10 rounded-full flex justify-center items-center">
              <MicIcon className="text-white w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default SendMessageForm;
