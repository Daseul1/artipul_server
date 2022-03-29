import { Sse, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { ArtImage } from '../artImage/entities/artImage.entity';
import { FileService } from '../file/file.service';
import { LikeArtService } from '../likeArt/likeArt.service';
import { ArtService } from './art.service';
import { CreateArtInput } from './dto/createArtInput';
import { Art } from './entities/art.entity';

@Resolver()
export class ArtResolver {
  constructor(
    private readonly artService: ArtService,
    private readonly fileService: FileService,
    private readonly likeArtService: LikeArtService,
  ) {}

  @Query(() => [Art])
  async fetchArts(
    @Args({ name: 'tags', type: () => [String] }) tags: string[],
    @Args({ name: 'createdAt', defaultValue: '1970-2-10' }) createdAt: string,
  ) {
    return await this.artService.findAll(tags, createdAt);
  }

  @Query(() => Art)
  async fetchArt(@Args('artId') artId: string) {
    return await this.artService.findOne(artId);
  }

  @Query(() => [ArtImage])
  async fetchArtImages(@Args('artId') artId: string) {
    return await this.artService.findImages({ artId });
  }

  // 미대생이 판매중인 작품 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Art])
  async fetchAuctionArts(@CurrentUser() currentUser: ICurrentUser) {
    return await this.artService.findAction({ currentUser });
  }

  // 일반유저(내가) 구매한 작품 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Art])
  async fetchtransactioncompletedArts(
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.artService.findcompleteAction({ currentUser });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Art)
  createArt(
    @Args('createArtInput') createArtInput: CreateArtInput, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.artService.create({ ...createArtInput }, currentUser);
  }

  @Mutation(() => [String])
  async uploadArtImage(
    @Args({ name: 'files', type: () => [GraphQLUpload] }) files: FileUpload[],
  ) {
    return await this.fileService.upload({ files });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async addLikeArt(
    @Args('artId') artId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.likeArtService.like(artId, currentUser.id);
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Art])
  async fetchLikeArt(@CurrentUser() currentUser: ICurrentUser) {
    return await this.likeArtService.find(currentUser.id);
  }
}
